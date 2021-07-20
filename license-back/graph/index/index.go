package index

import (
	"context"
	"fmt"
	"github.com/alec-z/license-back/graph/model"
	"github.com/olivere/elastic/v7"
)

func RebuildIndex() {
	var licenses []*model.License
	model.DB.Preload("LicenseFeatureTags").Find(&licenses)

	//增加到els mapping
	//检查索引是否存在
	els := model.ELS
	exists, err := els.IndexExists("licenses").Do(context.Background())
	if err != nil {
		fmt.Println(err)
	}
	if exists {
		els.DeleteIndex("licenses").Do(context.Background())

	}
	//索引不存在则创建索引
	//索引不存在时查询会报错，但索引不存在的时候可以直接插入
	_, err2 := els.CreateIndex("licenses").Do(context.Background())
	if err2 != nil {
		fmt.Println(err)
	}

	//写入els
	bulkRequest := els.Bulk()
	for _,info := range licenses {
		req := elastic.NewBulkIndexRequest().Index("licenses").Type("licenses").Id(string(info.ID)).Doc(info)
		bulkRequest = bulkRequest.Add(req)

	}
	bulkResponse, err := bulkRequest.Do(context.Background())
	if err != nil {
		fmt.Println(err)
	}
	if bulkResponse != nil {

	}
}