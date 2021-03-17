package model

import (
	"github.com/jinzhu/gorm"
	"time"
)

var DB *gorm.DB

type Dict struct {
	ID        int `gorm:"primary_key"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt *time.Time `sql:"index"`

	Type        string  `json:"type"`
	Order       int     `json:"order"`
	Name        string  `json:"name"`
	Description *string `json:"description"`
}

type License struct {
	ID        int `gorm:"primary_key"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt *time.Time `sql:"index"`

	Name        string `json:"name"`
	SpdxName    string `json:"spdxName"`
	Summary     string `json:"summary"`
	LicenseType *Dict  `json:"licenseType"`
	LicenseTypeID int
	Free        bool   `json:"free"`
	FullText    string `json:"fullText"`
	LicenseFeatureTags []*LicenseFeatureTag
}

func (l *License) CanFeatureTags() []*FeatureTag {
	return filterFeatureTag(l.LicenseFeatureTags, "can")
}

func (l *License) CannotFeatureTags() []*FeatureTag {
	return filterFeatureTag(l.LicenseFeatureTags, "cannot")
}

func (l *License) MustFeatureTags() []*FeatureTag {
	return filterFeatureTag(l.LicenseFeatureTags, "must")
}

func filterFeatureTag(licenseFeatureTags []*LicenseFeatureTag, tagType string) []*FeatureTag {
	var res []*FeatureTag
	featureTagIDs := make([]int, 0)
	for _, v := range licenseFeatureTags {
		if v.TagType == tagType {
			featureTagIDs = append(featureTagIDs, v.FeatureTagID)
		}
	}
	DB.Find(&res, featureTagIDs)
	return res
}

type FeatureTag struct {
	ID        int `gorm:"primary_key"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt *time.Time `sql:"index"`

	Order int
	Name string
	Description string
}

type LicenseFeatureTag struct {
	ID        int `gorm:"primary_key"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt *time.Time `sql:"index"`

	TagType string
	LicenseID int
	FeatureTag *FeatureTag
	FeatureTagID int
}
