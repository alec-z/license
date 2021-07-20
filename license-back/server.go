package main

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/alec-z/license-back/graph"
	"github.com/alec-z/license-back/graph/auth"
	"github.com/alec-z/license-back/graph/generated"
	"github.com/alec-z/license-back/graph/model"
	"github.com/go-chi/chi/v5"
	_ "github.com/go-sql-driver/mysql"
	"github.com/jinzhu/gorm"
	"github.com/olivere/elastic"
	"golang.org/x/oauth2"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
)

const defaultPort = "8080"

var db *gorm.DB

var ESClient *elastic.Client


func main() {
	http.DefaultTransport.(*http.Transport).TLSClientConfig = &tls.Config{InsecureSkipVerify: true}
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}
	initDB()
	initEls()
	srv := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: &graph.Resolver{ DB: db}}))
	router := chi.NewRouter()
	router.Use(auth.Middleware(db))
	router.Handle("/api_test", playground.Handler("GraphQL playground", "/graphql"))
	router.Handle("/graphql", srv)
	router.HandleFunc("/github_redirect", handleOAuth2Github)
	router.HandleFunc("/gitee_redirect", handleOAuth2Gitee)

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}



func handleOAuth2Gitee(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")



	respToken, errToken := http.PostForm(model.OAuth2ConfigObj.GiteeConfig.Endpoint.TokenURL +
		"?grant_type=authorization_code&code=" + code + "&client_id=" +
		model.OAuth2ConfigObj.GiteeConfig.ClientID +
		"&redirect_uri=" + model.OAuth2ConfigObj.GiteeConfig.RedirectURL,
		url.Values{
			"client_secret": {model.OAuth2ConfigObj.GiteeConfig.ClientSecret},
		})
	if errToken != nil {
		log.Println(errToken)
	}
	tokenStr, _ := ioutil.ReadAll(respToken.Body)
	var token oauth2.Token
	if err := json.Unmarshal([]byte(tokenStr), &token); err != nil {
		log.Println(err)
	}



	client :=  model.OAuth2ConfigObj.GiteeConfig.Client(model.OAuth2ConfigObj.Ctx, &token)
	resp, err := client.Get("https://gitee.com/api/v5/user")
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return
	}
	var res map[string]interface{}
	d := json.NewDecoder(strings.NewReader(string(body)))
	d.UseNumber()
	d.Decode(&res)
	var authID = string(res["id"].(json.Number))
	var user model.User
	db.FirstOrCreate(&user, model.User{AuthType: "gitee", AuthID: authID})
	user.AuthRawJson = string(body)
	user.AuthLogin = res["login"].(string)
	//user.AuthPrimaryEmail = res["email"]
	user.AvatarUrl = res["avatar_url"].(string)
	db.Save(&user)
	jwt, err := auth.CreateToken(user.ID)
	cookie := http.Cookie{Name: "jwt", Value: jwt, Path: "/"}
	http.SetCookie(w, &cookie)
	http.Redirect(w, r, "/auth-redirect", http.StatusFound)
}

func handleOAuth2Github(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	token, err := model.OAuth2ConfigObj.GithubConfig.Exchange(
		model.OAuth2ConfigObj.Ctx,
		code,
	)
	if err != nil {
		log.Println("An error occurred while trying to exchange the authorisation code with the Github API." + err.Error())
		return
	}
	client :=  model.OAuth2ConfigObj.GithubConfig.Client(model.OAuth2ConfigObj.Ctx, token)
 	if err != nil {
		return
	}
	resp, err := client.Get("https://api.github.com/user")
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return
	}
	var res map[string]interface{}
	d := json.NewDecoder(strings.NewReader(string(body)))
	d.UseNumber()
	d.Decode(&res)
	var authID = string(res["id"].(json.Number))
	var user model.User
	db.FirstOrCreate(&user, model.User{AuthType: "github", AuthID: authID})
	user.AuthRawJson = string(body)
	user.AuthLogin = res["login"].(string)
	//user.AuthPrimaryEmail = res["email"].(string)
	user.AvatarUrl = res["avatar_url"].(string)
	db.Save(&user)
	jwt, err := auth.CreateToken(user.ID)
	cookie := http.Cookie{Name: "jwt", Value: jwt, Path: "/"}
	http.SetCookie(w, &cookie)
	http.Redirect(w, r, "/auth-redirect", http.StatusFound)
}


func initDB() {
	var err error
	mysqlHost := os.Getenv("MYSQL_HOST")
	mysqlPassword := os.Getenv("MYSQL_PASSWORD")

	dataSourceName := fmt.Sprintf("root:%s@tcp(%s:3306)/license?charset=utf8mb4&parseTime=True&loc=Local", mysqlPassword, mysqlHost)
	db, err = gorm.Open("mysql", dataSourceName)

	if err != nil {
		fmt.Println(err)
		panic("failed to connect database")
	}

	db.LogMode(true)

	// Create the database. This is a one-time step.
	// Comment out if running multiple times - You may see an error otherwise

	// Migration to create tables for Order and Item schema
	db.AutoMigrate(&model.License{}, &model.Dict{}, &model.LicenseFeatureTag{}, &model.FeatureTag{}, &model.User{}, &model.UserVisit{}, &model.UserLicenseVisit{})
	model.DB = db
}


func initEls() {
	esURL := os.Getenv("ES_URL")
	esPassword := os.Getenv("ES_PASSWORD")
	esUser := "elastic"

	ESClient, err := elastic.NewClient(elastic.SetSniff(false), elastic.SetURL(esURL),elastic.SetBasicAuth(esUser,esPassword))
	if err != nil {
		fmt.Println(err)
		panic("Failed to build elasticsearch connection")
	}
	model.ELS = ESClient
}

