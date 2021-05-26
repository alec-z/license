package indexer

import (
	"bytes"
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"github.com/alec-z/tool-wrapper/model"
	"github.com/cenkalti/backoff/v4"
	"github.com/elastic/go-elasticsearch/v7"
	"github.com/elastic/go-elasticsearch/v7/estransport"
	"github.com/elastic/go-elasticsearch/v7/esutil"
	"log"
	"net/http"
	"net/url"
	"os"
	"time"
)
var ES *elasticsearch.Client
var bi esutil.BulkIndexer
var EsTransport *estransport.Client
func init() {
	retryBackoff := backoff.NewExponentialBackOff()
	var err error
	esURL := os.Getenv("ES_URL")
	esPassword := os.Getenv("ES_PASSWORD")

	esConfig := elasticsearch.Config{
		Addresses: []string{
			esURL,
		},
		// Retry on 429 TooManyRequests statuses
		//
		Username: "elastic",
		Password: esPassword,
		RetryOnStatus: []int{502, 503, 504, 429},
		Transport: &http.Transport{
			TLSClientConfig:    &tls.Config{InsecureSkipVerify: true},
		},

		// Configure the backoff function
		//
		RetryBackoff: func(i int) time.Duration {
			if i == 1 {
				retryBackoff.Reset()
			}
			return retryBackoff.NextBackOff()
		},

		// Retry up to 5 attempts
		//
		MaxRetries: 3,
	}
	ES, err = elasticsearch.NewClient(esConfig)
	if err != nil {
		fmt.Println(err)
	}
	urlES, _ := url.Parse(esURL)



	esConfig2 := estransport.Config{
		// Retry on 429 TooManyRequests statuses
		//
		URLs: []*url.URL{ urlES },
		Username: "elastic",
		Password: esPassword,
		RetryOnStatus: []int{502, 503, 504, 429},

		// Configure the backoff function
		//
		RetryBackoff: func(i int) time.Duration {
			if i == 1 {
				retryBackoff.Reset()
			}
			return retryBackoff.NextBackOff()
		},
		Transport: &http.Transport{
			TLSClientConfig:    &tls.Config{InsecureSkipVerify: true},
		},

		// Retry up to 5 attempts
		//
		MaxRetries: 3,
	}
	bi, err = esutil.NewBulkIndexer(esutil.BulkIndexerConfig{
		Index:      "scan_file_results",
		Client:     ES,
		NumWorkers: 3,
	})

	EsTransport, err = estransport.New(esConfig2)
}

func BulkIndexer(result *model.ToolResult) {
	if result.Tool.Name != "license_scan_general" {
		return
	}
	var r map[string]interface{}
	outputJSON := result.OutputRawJson
	json.Unmarshal([]byte(outputJSON), &r)
	files := r["files"].([]interface{})



	for _, file := range files {
		// Prepare the data payload: encode article to JSON
		//
		fileMap := file.(map[string]interface{})
		fileMap["repo"] = result.Repo
		fileMap["branch"] = result.Branch
		fileMap["repo_branch_hash"] = result.RepoBranchHash
		// Add an item to the BulkIndexer
		data, _ := json.Marshal(fileMap)
		//
		err := bi.Add(
			context.Background(),
			esutil.BulkIndexerItem{
				// Action field configures the operation to perform (index, create, delete, update)
				Action: "index",

				Body: bytes.NewReader(data),
			},
		)
		if err != nil {
			log.Printf("Unexpected error: %s", err)
		}
	}

	if err := bi.Close(context.Background()); err != nil {
		log.Printf("Unexpected error: %s", err)
	}
}

func Search(query string) {

	var buf bytes.Buffer
	var r map[string]interface{}
	// Perform the search request.
	res, err := ES.Search(
		ES.Search.WithContext(context.Background()),
		ES.Search.WithIndex("license_scan_general"),
		ES.Search.WithBody(&buf),
		ES.Search.WithTrackTotalHits(true),
		ES.Search.WithPretty(),
	)
	if err != nil {
		log.Printf("Error getting response: %s", err)
	}
	defer res.Body.Close()
	if res.IsError() {
		var e map[string]interface{}
		if err := json.NewDecoder(res.Body).Decode(&e); err != nil {
			log.Printf("Error parsing the response body: %s", err)
		} else {
			// Print the response status and error information.
			log.Printf("[%s] %s: %s",
				res.Status(),
				e["error"].(map[string]interface{})["type"],
				e["error"].(map[string]interface{})["reason"],
			)
		}
	}
	if err := json.NewDecoder(res.Body).Decode(&r); err != nil {
		log.Printf("Error parsing the response body: %s", err)
	}
	log.Printf(
		"[%s] %d hits; took: %dms",
		res.Status(),
		int(r["hits"].(map[string]interface{})["total"].(map[string]interface{})["value"].(float64)),
		int(r["took"].(float64)),
	)
}

