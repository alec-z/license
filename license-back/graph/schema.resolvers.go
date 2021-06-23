package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"
	"github.com/alec-z/license-back/graph/auth"
	"github.com/alec-z/license-back/graph/generated"
	"github.com/alec-z/license-back/graph/index"
	"github.com/alec-z/license-back/graph/model"
	"github.com/olivere/elastic"
	"golang.org/x/oauth2"
	"reflect"
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
	index.RebuildIndex()
	return license, nil
}

func (r *mutationResolver) UpdateLicense(ctx context.Context, licenseID int, input model.LicenseInput) (*model.License, error) {
	license := createLicenseFromInput(r.DB, &input)
	license.ID = licenseID
	r.DB.Model(&license).Updates(license)
	index.RebuildIndex()
	return license, nil
}

func (r *mutationResolver) DeleteLicense(ctx context.Context, licenseID int) (bool, error) {
	license := model.License{ID: licenseID}
	r.DB.Delete(&license)
	//调用els 重载数据
	index.RebuildIndex()
	return true, nil
}


func (r *mutationResolver) CreateUserVisit(ctx context.Context, toolResultID int) (*model.UserVisit, error) {
	var userVisit model.UserVisit
	user := auth.ForContext(ctx)
	if user == nil {
		return &userVisit, fmt.Errorf("Access denied")
	}
	userVisit.UserID = user.ID
	userVisit.ToolResultID = toolResultID
	r.DB.FirstOrCreate(&userVisit, model.UserVisit{UserID: user.ID, ToolResultID: toolResultID})
	return &userVisit, nil
}

func (r *mutationResolver) CreateUserLicenseVisit(ctx context.Context, licenseID int) (*model.UserLicenseVisit, error) {
	var userLicenseVisit model.UserLicenseVisit
	user := auth.ForContext(ctx)
	if user == nil {
		return &userLicenseVisit, nil
	}
	userLicenseVisit.UserID = user.ID
	userLicenseVisit.LicenseID = licenseID
	r.DB.FirstOrCreate(&userLicenseVisit, model.UserLicenseVisit{UserID: user.ID, LicenseID: licenseID})
	return &userLicenseVisit, nil
}

func (r *queryResolver) Licenses(ctx context.Context) ([]*model.License, error) {
	var licenses []*model.License
	r.DB.Preload("LicenseMainTags.MainTag").Preload("LicenseFeatureTags").Find(&licenses)
	return licenses, nil
}

func (r *queryResolver) License(ctx context.Context, licenseID int) (*model.License, error) {
	var license model.License
	r.DB.Preload("LicenseMainTags.MainTag").Preload("LicenseFeatureTags").First(&license, licenseID)
	return &license, nil
}

func (r *queryResolver) ListLicensesByType(ctx context.Context, indexType string, limit int) ([]*model.License, error) {
	var licenses []*model.License
	r.DB.Where("index_type = ?", indexType).Preload("LicenseMainTags.MainTag").Preload("LicenseFeatureTags").Limit(limit).Find(&licenses)
	return licenses, nil
}

func (r *queryResolver) ListLicensesByName(ctx context.Context, name string, limit int) ([]*model.License, error) {
	//输入长度小于4 不查询
	length := len(name)
	if length < 4 {
		return nil, nil
	}

	var licenses []*model.License
	var typeLicenses *model.License
	els := model.ELS
	//设置查询条件
	queryName := elastic.NewBoolQuery()
	querySpdxName := elastic.NewBoolQuery()
	queryKeyName := elastic.NewBoolQuery()
	queryKeySpdxName := elastic.NewBoolQuery()
	query := elastic.NewDisMaxQuery()

	queryName.Should(elastic.NewMatchPhrasePrefixQuery("name", name).Slop(10).Boost(1))
	querySpdxName.Should(elastic.NewMatchPhrasePrefixQuery("spdxName",name).Slop(10).Boost(1.5))
	queryKeySpdxName.Should(elastic.NewPrefixQuery("spdxName.keyword",name).Boost(2))
	queryKeyName.Should(elastic.NewPrefixQuery("name.keyword",name).Boost(0.5))
	query.TieBreaker(0.3).Query(queryName).Query(querySpdxName).Query(queryKeyName).Query(queryKeySpdxName)

	//获取查询结果
	var res *elastic.SearchResult
	res, err := els.Search().Index("licenses").Type("licenses").Query(query).RestTotalHitsAsInt(true).Pretty(true).Do(context.Background())
	if err != nil {
		panic(err)
	}
	//将结果转为对象输出
	for _, item := range res.Each(reflect.TypeOf(typeLicenses)) {
		t := item.(*model.License)
		licenses = append(licenses, t)
	}

	return licenses, nil
}

func (r *queryResolver) Oauth2AuthURL(ctx context.Context, provider string) (string, error) {
	var url string
	if provider == "github" {
		url = model.OAuth2ConfigObj.GithubConfig.AuthCodeURL("state", oauth2.AccessTypeOnline)
	} else {

		url = model.OAuth2ConfigObj.GiteeConfig.AuthCodeURL("state", oauth2.AccessTypeOnline)
	}
	return url, nil
}

func (r *queryResolver) ToolResult(ctx context.Context, toolResultID int) (*model.ToolResult, error) {
	var toolResult model.ToolResult

	if user := auth.ForContext(ctx); user == nil {
		return &toolResult, fmt.Errorf("Access denied")
	}

	r.DB.Preload("Tool").First(&toolResult, toolResultID)
	return &toolResult, nil
}

func (r *queryResolver) CurrentUser(ctx context.Context) (*model.User, error) {
	if user := auth.ForContext(ctx); user == nil {
		return &model.User{}, nil
	} else {
		return user, nil
	}
}

func (r *queryResolver) UserVisits(ctx context.Context) ([]*model.UserVisit, error) {
	var visits []*model.UserVisit
	if user := auth.ForContext(ctx); user != nil {
		r.DB.Model(user).Association("UserVisits")
		r.DB.Where("user_id = ?", user.ID).Preload("ToolResult").Find(&visits)
		return visits, nil
	}
	return visits, fmt.Errorf("Access denied")
}

func (r *queryResolver) UserLicenseVisits(ctx context.Context) ([]*model.UserLicenseVisit, error) {
	var visits []*model.UserLicenseVisit
	if user := auth.ForContext(ctx); user != nil {
		r.DB.Model(user).Association("UserLicenseVisits")
		r.DB.Where("user_id = ?", user.ID).Preload("License.LicenseMainTags.MainTag").Find(&visits)
		return visits, nil
	}
	return visits, fmt.Errorf("Access denied")
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }

// !!! WARNING !!!
// The code below was going to be deleted when updating resolvers. It has been copied here so you have
// one last chance to move it out of harms way if you want. There are two reasons this happens:
//  - When renaming or deleting a resolver the old code will be put in here. You can safely delete
//    it when you're done.
//  - You have helper methods in this file. Move them out to keep these resolver files clean.
type userLicenseVisitResolver struct{ *Resolver }
type toolResultResolver struct{ *Resolver }
