package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"
	"github.com/alec-z/license-back/graph/auth"
	"os"

	"github.com/alec-z/license-back/graph/generated"
	"github.com/alec-z/license-back/graph/model"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
)

func (r *mutationResolver) CreateDict(ctx context.Context, input model.DictInput) (*model.Dict, error) {
	dict := createDictFromInput(&input)
	r.DB.Create(&dict)
	return dict, nil
}

func (r *mutationResolver) UpdateDict(ctx context.Context, dictID int, input model.DictInput) (*model.Dict, error) {
	dict := createDictFromInput(&input)
	dict.ID = dictID
	r.DB.Model(&dict).Updates(&dict)
	return dict, nil
}

func (r *mutationResolver) DeleteDict(ctx context.Context, dictID int) (bool, error) {
	dict := model.Dict{ID: dictID}
	r.DB.Delete(&dict)
	return true, nil
}

func (r *mutationResolver) CreateFeatureTag(ctx context.Context, input model.FeatureTagInput) (*model.FeatureTag, error) {
	featureTag := createFeatureTagFromInput(&input)
	r.DB.Create(&featureTag)
	return featureTag, nil
}

func (r *mutationResolver) UpdateFeatureTag(ctx context.Context, featureTagID int, input model.FeatureTagInput) (*model.FeatureTag, error) {
	featureTag := model.FeatureTag{ID: featureTagID}
	r.DB.Delete(&featureTag)
	return &featureTag, nil
}

func (r *mutationResolver) CreateLicense(ctx context.Context, input model.LicenseInput) (*model.License, error) {
	license := createLicenseFromInput(r.DB, &input)
	r.DB.Create(license)
	return license, nil
}

func (r *mutationResolver) UpdateLicense(ctx context.Context, licenseID int, input model.LicenseInput) (*model.License, error) {
	license := createLicenseFromInput(r.DB, &input)
	license.ID = licenseID
	r.DB.Model(&license).Updates(license)

	return license, nil
}

func (r *mutationResolver) DeleteLicense(ctx context.Context, licenseID int) (bool, error) {
	license := model.License{ID: licenseID}
	r.DB.Delete(&license)
	return true, nil
}

func (r *queryResolver) Licenses(ctx context.Context) ([]*model.License, error) {
	var licenses []*model.License
	r.DB.Preload("LicenseType").Preload("LicenseFeatureTags").Find(&licenses)
	return licenses, nil
}

func (r *queryResolver) License(ctx context.Context, licenseID int) (*model.License, error) {
	var license model.License
	r.DB.Preload("LicenseType").Preload("LicenseFeatureTags").First(&license, licenseID)
	return &license, nil
}

func (r *queryResolver) ListLicensesByType(ctx context.Context, indexType string, limit int) ([]*model.License, error) {
	var licenses []*model.License
	r.DB.Where("index_type = ?", indexType).Preload("LicenseType").Preload("LicenseFeatureTags").Limit(limit).Find(&licenses)
	return licenses, nil
}

func (r *queryResolver) ListLicensesByName(ctx context.Context, name string, limit int) ([]*model.License, error) {
	var licenses []*model.License
	r.DB.Where("MATCH (spdx_name, name) AGAINST (?)", name).Preload("LicenseType").Preload("LicenseFeatureTags").Limit(limit).Find(&licenses)
	return licenses, nil
}

func (r *queryResolver) Oauth2AuthURL(ctx context.Context, provider string) (string, error) {
	const GithubClientID = "27467ab957f157bfc95b"
	const GiteeClientID = "faf8951baad9617a1fa7c69dc02894f5a7d6e9ac0e66d3f9624abd6bd168f4a4"
	const GiteeAuthURL = "https://gitee.com/oauth/authorize?redirect_uri=https://compliance.openeuler.org/oauth2/gitee_redirect"
	const GiteeTokenURL = "https://gitee.com/oauth/token?redirect_uri=https://compliance.openeuler.org/oauth2/gitee_redirect"

	if provider == "github" {
		githubSecret := os.Getenv("GITHUB_SECRET")
		r.oauth2Config = &oauth2.Config{
			ClientID:     GithubClientID,
			ClientSecret: githubSecret,
			Scopes:       []string{},
			Endpoint: oauth2.Endpoint{
				AuthURL:  github.Endpoint.AuthURL,
				TokenURL: github.Endpoint.TokenURL,
			},
		}
	} else {
		giteeSecret := os.Getenv("GITEE_SECRET")
		r.oauth2Config = &oauth2.Config{
			ClientID:     GiteeClientID,
			ClientSecret: giteeSecret,
			Scopes:       []string{},
			Endpoint: oauth2.Endpoint{
				AuthURL:  GiteeAuthURL,
				TokenURL: GiteeTokenURL,
			},
		}
	}
	url := r.oauth2Config.AuthCodeURL("state", oauth2.AccessTypeOnline)
	return url, nil
}

func (r *queryResolver) ToolResult(ctx context.Context, toolResultID int) (*model.ToolResult, error) {
	var toolResult model.ToolResult

	if user := auth.ForContext(ctx) ; user == nil {
		return &toolResult, fmt.Errorf("Access denied")
	}


	r.DB.Preload("Tool").First(&toolResult, toolResultID)
	return &toolResult, nil
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
