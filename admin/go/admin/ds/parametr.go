package ds

import (
	"database/sql"
	"github.com/onlineconf/onlineconf/admin/go/common"
)

type Parameter struct {
	ID                   int               `json:"-"`
	Name                 string            `json:"name"`
	ParentID             sql.NullInt64     `json:"-"`
	Path                 string            `json:"path"`
	Value                common.NullString `json:"data"`
	ContentType          string            `json:"mime"`
	Summary              string            `json:"summary"`
	Description          string            `json:"description"`
	Version              int               `json:"version"`
	MTime                string            `json:"mtime"`
	Deleted              bool              `json:"-"`
	NumChildren          int               `json:"num_children"`
	AccessModified       bool              `json:"access_modified"`
	RW                   common.NullBool   `json:"rw"`
	Notification         string            `json:"notification"`
	NotificationModified bool              `json:"notification_modified"`
}
