package graph

import (
	"github.com/alec-z/license-back/graph/model"
	"github.com/jinzhu/gorm"
	"strings"
)

func createLicenseFeatureTags(db *gorm.DB, tagInput []string, tagType string) []*model.LicenseFeatureTag {
	if len(tagInput) == 0 {
		return make([]*model.LicenseFeatureTag, 0)
	}
	for i, v := range tagInput {
		tagInput[i] = strings.TrimSpace(v)
	}
	var featureTags []*model.FeatureTag
	db.Where("name in (?)", tagInput).Find(&featureTags)
	licenseFeatureTags := make([]*model.LicenseFeatureTag, 0)
	for _, f := range featureTags {
		licenseFeatureTags = append(licenseFeatureTags, &model.LicenseFeatureTag{
			TagType:      tagType,
			FeatureTagID: f.ID,
		})
	}
	return licenseFeatureTags
}

func createLicenseFromInput(db *gorm.DB, input *model.LicenseInput) *model.License {
	license := model.License{
		Name:     input.Name,
		SpdxName: input.SpdxName,
		Summary:  input.Summary,
		FullText: input.FullText,
	}
	licenseFeatureTags := make([]*model.LicenseFeatureTag, 0)
	licenseFeatureTags = append(licenseFeatureTags, createLicenseFeatureTags(db, input.CanFeatureTags, "can")...)
	licenseFeatureTags = append(licenseFeatureTags, createLicenseFeatureTags(db, input.CannotFeatureTags, "cannot")...)
	licenseFeatureTags = append(licenseFeatureTags, createLicenseFeatureTags(db, input.MustFeatureTags, "must")...)
	license.LicenseFeatureTags = licenseFeatureTags
	db.Create(&license)
	return &license
}

func createDictFromInput(input *model.DictInput) *model.Dict {
	dict := model.Dict{
		Type:        input.Type,
		Order:       input.Order,
		Name:        input.Name,
		Description: input.Description,
	}
	return &dict
}

func createFeatureTagFromInput(input *model.FeatureTagInput) *model.FeatureTag {
	featureTag := model.FeatureTag{
		Name:        input.Name,
		Order:       input.Order,
		Description: input.Description,
	}
	return &featureTag
}
