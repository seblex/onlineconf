package admin

import (
	"context"
	"github.com/google/uuid"
)

type Plugin struct {
	ID      uuid.UUID `json:"id"`
	Name    string    `json:"name"`
	Enabled bool      `json:"enabled"`
}

func GetPluginsList(ctx context.Context) ([]Plugin, error) {
	return []Plugin{
		{
			ID:      uuid.New(),
			Name:    "etcd",
			Enabled: true,
		},
		{
			ID:      uuid.New(),
			Name:    "redis",
			Enabled: false,
		},
	}, nil
}
