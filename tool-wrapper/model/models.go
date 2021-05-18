package model

import (
	"gorm.io/gorm"
	"time"
)

var DB *gorm.DB


type ToolResult struct {
	ID        int `gorm:"primaryKey"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt *time.Time `sql:"index"`
	Repo      string `json:"repo"`
	Branch  string `json:"repoBranch"`
	RepoBranchHash string `repoBranchHash`
	FileCount int `json:"fileCount"`
	ScanedFileCount int `json:"scanedFileCount"`
	Tool Tool
	ToolID int
	BeginAt *time.Time `json:"beginAt"`
	FinishAt *time.Time `json:"finishAt"`
	OutputRawJson string `gorm:"type:longtext;not null" json:"repoBranch`
}

type 	Tool struct {
	ID        int `gorm:"primaryKey"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt *time.Time `sql:"index"`
	Name string
	CommandVersion string
	Command string
	Parameter string
	Description string
	ProcessPipe string
	ProcessFileFeature string
}

type CIRequest struct {
	Action string `json:"action"`
	Repo string `json:"repo"`
	Branch string `json:"branch"`
}
type CIResult struct{
	Pass bool `json:"pass"`
	Synchronous bool `json:"synchronous"`
	ReportFlag string `json:"report_flag"`
	ReportSummary string `json:"report_summary"`
	ReportUrl string `json:"report_url"`
}