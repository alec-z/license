package model
import (
	"context"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
	"os"
)
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

type OAuth2Config struct {
	GithubConfig *oauth2.Config
	GiteeConfig *oauth2.Config
	Ctx context.Context
	JWTSecret string
}

var OAuth2ConfigObj OAuth2Config

func init() {
	githubSecret := os.Getenv("GITHUB_SECRET")
	giteeSecret := os.Getenv("GITEE_SECRET")

	const GithubClientID = "27467ab957f157bfc95b"
	const GiteeClientID = "faf8951baad9617a1fa7c69dc02894f5a7d6e9ac0e66d3f9624abd6bd168f4a4"
	const GiteeAuthURL = "https://gitee.com/oauth/authorize"
	const GiteeTokenURL = "https://gitee.com/oauth/token"

	OAuth2ConfigObj.GiteeConfig = &oauth2.Config{
		ClientID:     GiteeClientID,
		ClientSecret: giteeSecret,
		Scopes:       []string{"user_info"},
		RedirectURL: "https://compliance.openeuler.org/gitee_redirect",
		//RedirectURL: "http://localhost:4200/gitee_redirect",
		Endpoint: oauth2.Endpoint{
			AuthURL:  GiteeAuthURL,
			TokenURL: GiteeTokenURL,
			AuthStyle: 1,
		},
	}

	OAuth2ConfigObj.GithubConfig = &oauth2.Config{
		ClientID:     GithubClientID,
		ClientSecret: githubSecret,
		Scopes:       []string{},
		RedirectURL: "http://compliance.openeuler.org/github_redirect",
		Endpoint: oauth2.Endpoint{
			AuthURL:  github.Endpoint.AuthURL,
			TokenURL: github.Endpoint.TokenURL,
		},
	}
	OAuth2ConfigObj.Ctx = context.Background()
	OAuth2ConfigObj.JWTSecret = os.Getenv("JWT_SECRET")
}