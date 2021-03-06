// Code generated by github.com/99designs/gqlgen, DO NOT EDIT.

package model

type ChangeRequestInput struct {
	ID              int    `json:"id"`
	Type            string `json:"type"`
	ObjectID        *int   `json:"objectId"`
	ObjectUpdatedAt string `json:"objectUpdatedAt"`
	ChangeOperation string `json:"changeOperation"`
	Attributes      string `json:"attributes"`
}

type CompareResult struct {
	CanFeatureTags    *FeatureTagDifference `json:"canFeatureTags"`
	CannotFeatureTags *FeatureTagDifference `json:"cannotFeatureTags"`
	MustFeatureTags   *FeatureTagDifference `json:"mustFeatureTags"`
}

type DictInput struct {
	Type        string  `json:"type"`
	Order       int     `json:"order"`
	Name        string  `json:"name"`
	Description *string `json:"description"`
}

type FeatureTagDifference struct {
	More []*FeatureTag `json:"more"`
	Less []*FeatureTag `json:"less"`
}

type FeatureTagInput struct {
	Name        string `json:"name"`
	Order       int    `json:"order"`
	Description string `json:"description"`
}

type LicenseInput struct {
	Name              string   `json:"name"`
	SpdxName          string   `json:"spdxName"`
	Summary           string   `json:"summary"`
	FullText          string   `json:"fullText"`
	CanFeatureTags    []string `json:"canFeatureTags"`
	CannotFeatureTags []string `json:"cannotFeatureTags"`
	MustFeatureTags   []string `json:"mustFeatureTags"`
}
