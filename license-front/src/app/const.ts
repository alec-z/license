const NoneLicenseFiles = `
{
  "from": $from,
  "size": $size,
  "query" : {
    "constant_score" : { 
      "filter" : {
        "bool": {
          "must": [
            { "term": {"is_text": true} },
            { "term": {"repo_branch_hash": "$repoBranchHash"} }
          ],
          "must_not": [
            { "exists": {"field": "license_expressions"}}
          ]
        }
      }
    }
  },
  "sort": { "path.keyword": { "order": "asc" }}
}
`;

const SomeLicenseFiles = `
{
  "from": $from,
  "size": $size,
  "query" : {
    "constant_score" : { 
      "filter" : {
        "bool": {
          "must": [
            { "term": {"is_text": true} },
            { "term": {"repo_branch_hash": "$repoBranchHash"} },
            { "term": {"license_expressions.keyword": "$someType"} }
          ]
        }
      }
    }
  },
  "sort": { "path.keyword": { "order": "asc" }}
}
`;


const BadLicenseFiles = `
{
  "from": $from,
  "size": $size,
  "query" : {
    "constant_score" : { 
      "filter" : {
        "bool": {
          "must": [
            { "terms": {"license_expressions.keyword": [
              "gpl", "Lgpl", "agpl",
              "agpl-1.0","agpl-2.0","agpl-3.0",
              "gpl-1.0","gpl-2.0","gpl-3.0",
              "lgpl-1.0","lgpl-2.0","lgpl-3.0",
               "agpl-1.0-only","agpl-1.0-or-later","agpl-2.0-only","agpl-2.0-or-later","agpl-3.0-only","agpl-3.0-or-later",
              "gpl-1.0-only","gpl-1.0-or-later","gpl-2.0-only","gpl-2.0-or-later","gpl-3.0-only","gpl-3.0-or-later",
              "lgpl-1.0-only","lgpl-1.0-or-later","lgpl-2.0-only","lgpl-2.0-or-later","lgpl-3.0-only","lgpl-3.0-or-later"
              ]} },
            { "term": {"repo_branch_hash": "$repoBranchHash"} }
          ]
        }
      }
    }
  },
  "sort": { "path.keyword": { "order": "asc" }}
}
`;

const LicenseTypes = `
{
  "size" : 0,
  "query": {
    "constant_score": {
      "filter": 
        { "term": { "repo_branch_hash": "$repoBranchHash"   }}
      
    }
  },
  "aggs": {
    "aggs_types": {
      "terms": { "field": "license_expressions.keyword" } 
    }
  }
}
`;

const NoneCopyrightFiles = `
{
  "from": $from,
  "size": $size,
  "query" : {
    "constant_score" : { 
      "filter" : {
        "bool": {
          "must": [
            { "term": {"is_text": true} },
            { "term": {"repo_branch_hash": "$repoBranchHash"} }
          ],
          "must_not": [
            { "exists": {"field": "copyrights"}}
          ]
        }
      }
    }
  },
  "sort": { "path.keyword": { "order": "asc" }}
}
`;

const SomeCopyrightFiles = `
{
  "from": $from,
  "size": $size,
  "query" : {
    "constant_score" : { 
      "filter" : {
        "bool": {
          "must": [
            { "term": {"is_text": true} },
            { "term": {"repo_branch_hash": "$repoBranchHash"} },
            { "term": {"copyrights.value.keyword": "$someType"} }
          ]
        }
      }
    }
  },
  "sort": { "path.keyword": { "order": "asc" }}
}
`;

const CopyrightTypes = `
{
  "size": 0,
  "query" : {
    "constant_score" : { 
      "filter" : {
        "bool": {
          "must": [
            { "term": {"is_text": true} },
            { "term": {"repo_branch_hash": "$repoBranchHash"} }
          ]
        }
      }
    }
  },
  "aggs": {
    "aggs_types": {
      "terms": { "field": "copyrights.value.keyword" } 
    }
  }
}
`;


export const Searchs: any = {
  NoneLicenseFiles,
  BadLicenseFiles,
  LicenseTypes,
  NoneCopyrightFiles,
  CopyrightTypes,
  SomeCopyrightFiles,
  SomeLicenseFiles
};



