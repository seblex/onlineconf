package admin

import (
	"context"
	"github.com/google/uuid"
)

type Plugin struct {
	ID           uuid.UUID `json:"id"`
	Name         string    `json:"name"`
	Enabled      bool      `json:"enabled"`
	Info         string    `json:"info"`
	ConfigFields []string  `json:"config_fields"`
}

func GetPluginsList(ctx context.Context) ([]Plugin, error) {
	return []Plugin{
		{
			ID:           uuid.New(),
			Name:         "etcd",
			Enabled:      true,
			Info:         "![etcd Logo](https://www.oddeye.co/documentation/images/etcd.png) \n# H1 test\n\n ## H2 test\n\n- test box 1\n- test box 2",
			ConfigFields: []string{"address"},
		},
		{
			ID:           uuid.New(),
			Name:         "redis",
			Enabled:      false,
			Info:         "# this is redis H1 test\n# H2 test\n\n- test box 1\n- test box 2",
			ConfigFields: []string{"address"},
		},
	}, nil
}
