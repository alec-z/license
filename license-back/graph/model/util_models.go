package model

type CIResult struct{
	Pass bool `json:"pass"`
	Synchronous bool `json:"synchronous"`
	ReportFlag string `json:"report_flag"`
	ReportSummary string `json:"report_summary"`
	ReportUrl string `json:"report_url"`
}

type CIRequest struct {
	Action string `json:"action"`
	Repo string `json:"repo"`
	Branch string `json:"branch"`
	ActionParameter string `json:"action_parameter"`
}
