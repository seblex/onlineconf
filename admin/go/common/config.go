package common

import "github.com/google/uuid"

type DatabaseConfig struct {
	Host        string
	User        string
	Password    string
	Base        string
	Timeout     int
	MaxLifetime int `yaml:"max_lifetime"`
	MaxConn     int `yaml:"max_conn"`
}

type CommonConfig struct {
	Database DatabaseConfig
}

func CommonInitialize(c CommonConfig) {
	DB = OpenDatabase(c.Database)
}

type PluginConfigContributor func(key string) (string, error)

type PluginInfo struct {
	ID      uuid.UUID `json:"id"`
	Name    string    `json:"name"`
	Enabled bool      `json:"enabled"`
	Info    string    `json:"info"`
}
