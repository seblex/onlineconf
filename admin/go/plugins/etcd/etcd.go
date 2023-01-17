package etcd

import (
	"context"
	_ "embed"
	"github.com/coreos/etcd/clientv3"
	"github.com/google/uuid"
	"github.com/onlineconf/onlineconf/admin/go/common"
	"sync/atomic"
	"time"
)

const PluginName = "etcd"

//go:embed README.md
var b []byte

type ETCD struct {
	ready atomic.Bool
	kv    clientv3.KV
}

func (e *ETCD) startUpdateCfgProcessor(ctx context.Context, getConfigValue common.PluginConfigContributor) {
	select {
	case <-time.Tick(30 * time.Second):
		enableStr, err := getConfigValue("enable")
		if err != nil || enableStr != "true" {
			e.ready.Store(false)
		}

		e.ready.Store(true)
		return
	}
}

func GetPluginName() string {
	return PluginName
}
func New(contribute common.PluginConfigContributor) (*ETCD, error) {
	cli, err := clientv3.New(clientv3.Config{
		Endpoints: []string{"192.168.0.110:2379"},
		// Endpoints: []string{"localhost:2379", "localhost:22379", "localhost:32379"}
		DialTimeout: 5 * time.Second,
	})
	if err != nil {
		return nil, err
	}

	kv := clientv3.NewKV(cli)

	readiness := atomic.Bool{}
	readiness.Store(false)

	return &ETCD{
		kv:    kv,
		ready: readiness,
	}, nil
}

func (e *ETCD) GetHints(ctx context.Context, prefix string) ([]string, error) {
	resp, err := e.kv.Get(ctx, prefix, clientv3.WithPrefix())
	if err != nil {
		return nil, err
	}

	res := make([]string, len(resp.Kvs))
	for i, kv := range resp.Kvs {
		res[i] = string(kv.Key)
	}

	return res, nil
}

func (e *ETCD) GetInfo(ctx context.Context) common.PluginInfo {
	return common.PluginInfo{
		ID:      uuid.New(),
		Name:    "PluginName",
		Enabled: true,
		Info:    string(b),
	}
}

func (e *ETCD) ReadyStatus() bool {
	return e.ready.Load()
}
