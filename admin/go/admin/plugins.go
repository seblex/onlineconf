package admin

import (
	"context"
	_ "embed"
	"github.com/onlineconf/onlineconf/admin/go/common"
	"github.com/onlineconf/onlineconf/admin/go/plugins/etcd"
	"log"
)

type IncludedPlugin interface {
	GetInfo(ctx context.Context) common.PluginInfo
	GetHints(ctx context.Context, prefix string) ([]string, error)
	ReadyStatus() bool
}

var IncludedPlugins []IncludedPlugin

func InitPluginsUsage(ctx context.Context) {
	etcd, err := etcd.New(func(key string) (string, error) {
		param, err := SelectParameter(ctx, "/onlineconf/plugins/%s/%s"+etcd.GetPluginName()+key)

		return param.Value.String, err
	})
	if err != nil {
		log.Println("cant load etcd plugin")
	}
	IncludedPlugins = append(IncludedPlugins, etcd)
}

func GetPluginsList(ctx context.Context) ([]common.PluginInfo, error) {
	res := make([]common.PluginInfo, len(IncludedPlugins))
	for i, p := range IncludedPlugins {
		if !p.ReadyStatus() {
			continue
		}

		res[i] = p.GetInfo(ctx)
	}

	return res, nil
}
