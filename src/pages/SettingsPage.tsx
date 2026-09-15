import { useEffect, useState } from 'react'

import InfoIcon from '@/assets/icons/information-line.svg?react'
import LinkIcon from '@/assets/icons/links-line.svg?react'
import PaletteIcon from '@/assets/icons/palette-line.svg?react'
import RefreshIcon from '@/assets/icons/refresh-line.svg?react'
import UserIcon from '@/assets/icons/user-line.svg?react'
import { ListItem } from '@/components/ListItem'
import { ScreenShell } from '@/components/ScreenShell'
import { showToast } from '@/components/toastStore'
import { useNavStore } from '@/nav/store'
import { findBackground } from '@/settings/backgrounds'
import { useSettingsStore } from '@/settings/store'
import { getAppVersion } from '@/settings/version'
import { manualCheckForUpdate } from '@/update/bridge'

import { Browser } from '@capacitor/browser'

function openExternal(url: string): void {
  void Browser.open({ url })
}

export function SettingsPage() {
  const [version, setVersion] = useState('…')
  const [checking, setChecking] = useState(false)
  const push = useNavStore((s) => s.push)
  const backgroundId = useSettingsStore((s) => s.chatBackgroundId)

  useEffect(() => {
    void getAppVersion().then(setVersion)
  }, [])

  const onCheck = async (): Promise<void> => {
    setChecking(true)
    try {
      const result = await manualCheckForUpdate()

      switch (result.kind) {
        case 'update':
          showToast('发现新版本')
          push('messages', 'left')
          break
        case 'up-to-date':
          showToast('已是最新版本')
          break
        case 'failed':
          showToast(result.reason)
          break
      }
    } finally {
      setChecking(false)
    }
  }

  return (
    <ScreenShell title="设置" bodyClassName="screen-body--muted">
      <section className="list-group">
        <h2 className="list-group__title">外观</h2>

        <div className="list-group__body">
          <ListItem
            icon={<PaletteIcon />}
            title="聊天背景"
            value={findBackground(backgroundId).name}
            chevron
            onClick={() => push('chatBackground')}
          />
        </div>
      </section>

      <section className="list-group">
        <h2 className="list-group__title">更新</h2>

        <div className="list-group__body">
          <ListItem icon={<InfoIcon />} title="版本" value={version} />

          <ListItem
            icon={<RefreshIcon />}
            title="检查更新"
            value={checking ? '检查中…' : undefined}
            chevron={!checking}
            onClick={
              checking ? undefined : () => void onCheck()
            }
          />
        </div>
      </section>

      <section className="list-group">
        <h2 className="list-group__title">关于</h2>

        <div className="list-group__body">
          <ListItem
            icon={<UserIcon />}
            title="关于作者"
            chevron
            onClick={() => openExternal('https://www.beijiu.top/')}
          />

          <ListItem
            icon={<LinkIcon />}
            title="开源地址"
            chevron
            onClick={() => openExternal('https://github.com/beijiushare/JianjiaOS')}
          />

          <ListItem
            icon={<InfoIcon />}
            title="致谢"
            chevron
            onClick={() => push('credits')}
          />
        </div>
      </section>
    </ScreenShell>
  )
}
