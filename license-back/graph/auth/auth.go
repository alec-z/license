package auth

import (
	"context"
	"github.com/alec-z/license-back/graph/model"
	"github.com/dgrijalva/jwt-go"
	"github.com/jinzhu/gorm"
	"net/http"
	"strconv"
	"strings"
	"time"
)

var userCtxKey = &contextKey{"user"}

type contextKey struct {
	name string
}

func Middleware(db *gorm.DB) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			tokenStr := extractToken(r)
			if tokenStr != "" {
				token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
					return []byte(model.OAuth2ConfigObj.JWTSecret), nil
				})
				if err == nil {
					userId := token.Claims.(jwt.MapClaims)["sub"].(string)
					user := getUserByID(db, userId)
					if user.ID != 0 {
						ctx := context.WithValue(r.Context(), userCtxKey, user)
						r = r.WithContext(ctx)
						newJwt, _ := CreateToken(user.ID)
						w.Header().Set("new-jwt", newJwt)
						next.ServeHTTP(w, r)
						return
					}
				}
				w.Header().Set("new-jwt", "")
			}
			next.ServeHTTP(w, r)
		})
	}
}

// ForContext finds the user from the context. REQUIRES Middleware to have run.
func ForContext(ctx context.Context) *model.User {
	raw, _ := ctx.Value(userCtxKey).(*model.User)
	return raw
}

func extractToken(r *http.Request) string {
	bearToken := r.Header.Get("Authorization")
	//normally Authorization the_token_xxx
	strArr := strings.Split(bearToken, " ")
	if len(strArr) == 2 {
		return strArr[1]
	}
	return ""
}

func getUserByID(db *gorm.DB, userID string) *model.User {
	var user model.User

	userIDInt, _ := strconv.Atoi(userID)
	db.First(&user, userIDInt)
	return &user
}

func CreateToken(userID int) (string, error) {
	var err error
	//Creating Access Token
	atClaims := jwt.StandardClaims{}
	atClaims.Subject = strconv.Itoa(userID)
	atClaims.ExpiresAt = time.Now().Add(time.Minute * 60).Unix()
	at := jwt.NewWithClaims(jwt.SigningMethodHS256, atClaims)
	token, err := at.SignedString([]byte(model.OAuth2ConfigObj.JWTSecret))
	if err != nil {
		return "", err
	}
	return token, nil
}
