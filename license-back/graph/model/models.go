package model

import (
	"github.com/jinzhu/gorm"
	"time"
)

var DB *gorm.DB
type Tool struct {
	ID        int `gorm:"primary_key"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt *time.Time `sql:"index"`

	Name     string  `json:"name"`
	ScanRate float64 `json:"scanRate"`
	StepNumber int `json:"stepNumber"`
}

type ToolResult struct {
	ID        int `gorm:"primary_key"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt *time.Time `sql:"index"`

	Repo            string `json:"repo"`
	Branch          string `json:"branch"`
	RepoBranchHash  string `json:"repoBranchHash"`
	Tool            *Tool    `json:"tool"`
	ToolID          int
	OutputRawJSON   string `json:"outputRawJson"`
	FileCount       int    `json:"fileCount"`
	ScanedFileCount int    `json:"scanedFileCount"`
}

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

func differenceFeatureTag(tags1, tags2 []*FeatureTag) []*FeatureTag {
	m := make(map[int]bool)
	res := make([]*FeatureTag, 0)

	for _, v2 := range tags2 {
		m[v2.ID] = true
	}

	for _, v1 := range tags1 {
		_, ok := m[v1.ID]
		if !ok {
			res = append(res, v1)
		}
	}
	return res
}


func (l *License) CompareWith(otherLicenseID int) *CompareResult {
	var otherLicense License
	DB.Preload("LicenseType").Preload("LicenseFeatureTags").First(&otherLicense, otherLicenseID)
	var compareResult CompareResult
	compareResult.CanFeatureTags = new(FeatureTagDifference)
	compareResult.CannotFeatureTags = new(FeatureTagDifference)
	compareResult.MustFeatureTags = new(FeatureTagDifference)

	compareResult.CanFeatureTags.More = differenceFeatureTag(l.CanFeatureTags(), otherLicense.CanFeatureTags())
	compareResult.CanFeatureTags.Less = differenceFeatureTag(otherLicense.CanFeatureTags(), l.CanFeatureTags())

	compareResult.CannotFeatureTags.More = differenceFeatureTag(l.CannotFeatureTags(), otherLicense.CannotFeatureTags())
	compareResult.CannotFeatureTags.Less = differenceFeatureTag(otherLicense.CannotFeatureTags(), l.CannotFeatureTags())

	compareResult.MustFeatureTags.More = differenceFeatureTag(l.MustFeatureTags(), otherLicense.MustFeatureTags())
	compareResult.MustFeatureTags.Less = differenceFeatureTag(otherLicense.MustFeatureTags(), l.MustFeatureTags())

	return &compareResult
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

type User struct {
	ID        int `gorm:"primary_key"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt *time.Time `sql:"index"`
	AuthType string `json:"authType"`
	AuthID   string  `json:"authID"`
	AuthLogin string `json:"authLogin"`
	AuthPrimaryEmail string `json:"authEmail"`
	AuthRawJson string
	AvatarUrl string `json:"avatarUrl"`
}



