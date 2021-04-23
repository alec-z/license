package main

import (
	"encoding/json"
	"fmt"
	"github.com/alec-z/license-back/graph/model"
	"github.com/jinzhu/gorm"
	"log"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/alec-z/license-back/graph"
	"github.com/alec-z/license-back/graph/generated"
	_ "github.com/go-sql-driver/mysql"
)

const defaultPort = "8080"

var db *gorm.DB

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}
	initDB()
	srv := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: &graph.Resolver{ DB: db}}))

	http.Handle("/api_test", playground.Handler("GraphQL playground", "/graphql"))
	http.Handle("/graphql", srv)
	http.Handle("/ci", generateCISrv())
	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func generateCISrv() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Content-Type", "application/json")
		var request model.CIRequest
		err := json.NewDecoder(r.Body).Decode(&request)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		var result model.CIResult
		result.Pass = true
		result.Synchronous = false
		result.ReportFlag = "INFO"
		result.ReportSummary = request.Action + ":" + request.ActionParameter + ":" + request.Repo + ":"+ request.Branch + ":" + "Report will be generate in 10-15 minutes, please check the report url since then"
		result.ReportUrl = "http://compliance.openeuler.org/xxx"
		resultBytes, err := json.Marshal(result)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		fmt.Fprint(w, string(resultBytes))
	}

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
	db.AutoMigrate(&model.License{}, &model.Dict{}, &model.LicenseFeatureTag{}, &model.FeatureTag{})
	model.DB = db
}