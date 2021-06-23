package graph
//go:generate go run github.com/99designs/gqlgen
import (
	"github.com/jinzhu/gorm"
	"github.com/olivere/elastic"
	"golang.org/x/oauth2"
)

type Resolver struct{
	DB *gorm.DB
	oauth2Config *oauth2.Config
	ELS *elastic.Client
}
