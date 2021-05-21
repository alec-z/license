package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"github.com/alec-z/tool-wrapper/indexer"
	"github.com/alec-z/tool-wrapper/model"
	"github.com/go-chi/chi/v5"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"io"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"os"
	"os/exec"
	"regexp"
	"strconv"
	"strings"
	"time"
)

const DefaultPort = "8081"
const BaseDir = "/tmp"
const ReportBaseUrl ="https://compliance.openeuler.org/report/"
const StepNum = 5

var db *gorm.DB


func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = DefaultPort
	}
	initDB()
	router := chi.NewRouter()
	router.HandleFunc("/ci", handleCI)
	log.Printf("connect to http://localhost:%s/ for tool wrapper", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}

func handleCI(w http.ResponseWriter, r *http.Request) {

	defer func() {
		if e := recover(); e != nil {
			log.Println("recover from request")
		}
	}()

	w.Header().Add("Content-Type", "application/json")
	var request model.CIRequest
	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}


	toolResult := findOrCreateToolResult(request.Action, request.Repo, request.Branch)

	go runTool(toolResult, request.Repo, request.Branch)

	var result model.CIResult
	result.Pass = true
	result.Synchronous = false
	result.ReportFlag = "INFO"
	result.ReportSummary = "Report will be generate in 10-15 minutes, please check the report url since then"
	result.ReportUrl = ReportBaseUrl + strconv.Itoa(toolResult.ID)
	resultBytes, err := json.Marshal(result)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	fmt.Fprint(w, string(resultBytes))
}
func findOrCreateToolResult(toolName string, repo string, branch string) *model.ToolResult {


	var tool model.Tool
	db.Where("name = ?", toolName).First(&tool)
	if tool.ID == 0 {
		log.Println("Cannot find this tool " + toolName)
		panic("Cannot find this tool " + toolName)
	}
	tagHash :=checkBranch(repo, branch)
	var toolResult model.ToolResult
	db.Where(model.ToolResult{ToolID: tool.ID, RepoBranchHash: tagHash}).FirstOrCreate(&toolResult)
	if toolResult.Repo != repo || toolResult.Branch != branch {
		toolResult.Repo = repo
		toolResult.Branch = branch
		db.Save(toolResult)
	}
	return &toolResult
}

func runTool(toolResult *model.ToolResult, repo string, branch string) {
	if toolResult.OutputRawJson == "" {
		begin := time.Now()
		toolResult.BeginAt = &begin
		db.Save(toolResult)

		db.Model(toolResult).Association("Tool").Find(&toolResult.Tool)
		tool := &toolResult.Tool
		workDir := strconv.FormatInt(time.Now().Unix(), 10) + "_" +
			strconv.Itoa(rand.Int())
		dir := BaseDir + "/" + tool.Name + "/" + workDir
		createWorkDir(dir)


		fileCount := gitCloneAndCount(dir, repo, branch)
		toolResult.FileCount = fileCount
		db.Save(toolResult)
		execTool(dir, toolResult)
		outputJson := readOutput(dir)
		clearUp(dir)
		toolResult.OutputRawJson = outputJson
		finish := time.Now()
		toolResult.FinishAt = &finish
		db.Save(toolResult)
		indexer.BulkIndexer(toolResult)
	}

}

func checkBranch(repo, branch string) string {
	cmd := exec.Command("git","ls-remote", repo, branch)
	result, err := cmd.Output()
	if err != nil {
		log.Println("git ls-remote " + repo + " " + branch + "Execute Command failed:" + err.Error())
		panic("git ls-remote " + repo + " " + branch + "Execute Command failed:" + err.Error())
	}
	re := regexp.MustCompile("\\s+")

	log.Println("git ls-remote " + repo + " " + branch  + "Execute Command finished.")
	split := re.Split(string(result), -1)
	if len(split) >= 2 {
		return split[0]
	} else {
		return ""
	}
}
func createWorkDir(dir string) {
	cmd := exec.Command("mkdir","-p", dir)
	err := cmd.Run()
	if err != nil {
		log.Println("mkdir " + dir + " Execute Command failed:" + err.Error())
		panic("mkdir " + dir + " Execute Command failed:" + err.Error())
	}
	log.Println("mkdir " + dir + "Execute Command finished.")
}


func gitCloneAndCount(dir string, repo string, branch string) int {
	repoName := extractRepoName(repo)
	cmd := exec.Command("git", "clone", "-b", branch, repo, dir + "/" + repoName)
	err := cmd.Run()
	if err != nil {
		log.Println("Git clone Execute Command failed:" + err.Error())
		panic("Git clone Execute Command failed:" + err.Error())
	}
	log.Println("git clone " + dir + "Execute Command finished.")
	cmdStr := `cd ` + dir + "/" + repoName + ` && git ls-files --no-empty-directory --exclude-standard | wc -l`
	cmdCount := exec.Command("bash", "-c", cmdStr)
	output, err2 := cmdCount.Output()
	if err2 != nil {
		log.Println("Git ls-files count Execute Command failed:" + err.Error())
		panic("Git ls-files count Execute Command failed:" + err.Error())
	}
	reg := regexp.MustCompile(`\s+`)
	res := reg.ReplaceAllString(string(output), "")
	log.Println("git ls-files count " + dir + "Execute Command finished.")
	resInt, _ := strconv.Atoi(res)
	return resInt
}

func extractRepoName (repo string) string {
	split := strings.Split(repo, "/")
	return split[len(split)-1]
}

func execTool(dir string, toolResult *model.ToolResult) {
	re := regexp.MustCompile("\\s+")
	tool := &toolResult.Tool
	split := re.Split(tool.Parameter, -1)
	repoName := extractRepoName(toolResult.Repo)
	for i, v := range split {
		if v == "{output-file}" {
			split[i] = dir + "/output.json"
		} else if v == "{input-dir}"{
			split[i] = dir + "/" + repoName
		}
	}
	cmd := exec.Command(tool.Command, split...)
	var outPipe io.ReadCloser
	if tool.ProcessPipe == "stdErr" {
		outPipe, _ = cmd.StderrPipe()
	} else if tool.ProcessPipe == "stdOut" {
		outPipe, _ = cmd.StdoutPipe()
	}

	defer outPipe.Close()
	done := make(chan int)
	scanner := bufio.NewScanner(outPipe)
	stepLength := toolResult.FileCount / StepNum
	step := 0

	go func() {
		scannedFlag := regexp.MustCompile(tool.ProcessFileFeature)
		scannedCount := 0
		// Read line by line and process it
		for scanner.Scan() {
			line := scanner.Text()
			matches := scannedFlag.FindAllStringIndex(line, -1)
			if len(matches) > 0 {
				scannedCount += len(matches)
				if scannedCount >= (step + 1) * stepLength {
					step += 1
					toolResult.ScanedFileCount = scannedCount
					db.Save(toolResult)
				}
			}
		}

		// We're all done, unblock the channel
		done <- scannedCount


	}()
	var err error


	if err = cmd.Start(); err != nil {
		fmt.Println(err)
	}

	scannedFileCount := <-done
	fmt.Println(scannedFileCount)

	err = cmd.Wait()

	if err != nil {
		log.Println("scancode Execute Command failed:" + err.Error())
		panic("scancode Execute Command failed:" + err.Error())
	}

	log.Println("scancode " + dir + "Execute Command finished.")
}

func readOutput(dir string) string {
	content, err := ioutil.ReadFile(dir + "/output.json")
	if err != nil {
		log.Println("read output Execute Command failed:" + err.Error())
		panic("read output Execute Command failed:" + err.Error())
	}
	log.Println("read output " + dir + "Execute Command finished.")
	return string(content)
}


func clearUp(dir string) {
	cmd := exec.Command("rm","-rf", dir)
	err := cmd.Run()
	if err != nil {
		log.Println("rm clear up Execute Command failed:" + err.Error())
		panic("rm clear up Execute Command failed:" + err.Error())
	}
	log.Println("rm clear up " + dir + "Execute Command finished.")
}




func initDB() {
	// init log
	log.SetPrefix("Tool Wrapper: ")
	log.SetFlags(log.Ldate | log.Lmicroseconds | log.Lshortfile)
	var err error
	mysqlHost := os.Getenv("MYSQL_HOST")
	mysqlPassword := os.Getenv("MYSQL_PASSWORD")

	dataSourceName := fmt.Sprintf("root:%s@tcp(%s:3306)/license?charset=utf8mb4&parseTime=True&loc=Local", mysqlPassword, mysqlHost)

	db, err = gorm.Open(mysql.Open(dataSourceName), &gorm.Config{})

	if err != nil {
		log.Println(err)
		panic("failed to connect database")
	}

	db.AutoMigrate(&model.ToolResult{}, &model.Tool{})
	model.DB = db
}

func initES() {

}