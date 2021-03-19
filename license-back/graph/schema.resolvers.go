package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/alec-z/license-back/graph/generated"
	"github.com/alec-z/license-back/graph/model"
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
type licenseResolver struct{ *Resolver }
