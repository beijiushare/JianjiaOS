import { useEffect, useState } from 'react'

import InfoIcon from '@/assets/icons/information-line.svg?react'
import PaletteIcon from '@/assets/icons/palette-line.svg?react'
import RefreshIcon from '@/assets/icons/refresh-line.svg?react'
import { ListItem } from '@/components/ListItem'
import { ScreenShell } from '@/components/ScreenShell'
import { showToast } from '@/components/toastStore'
import { useNavStore } from '@/nav/store'
import { findBackground } from '@/settings/backgrounds'
import { useSettingsStore } from '@/settings/store'
import { getAppVersion } from '@/settings/version'
import { manualCheckForUpdate } from '@/update/bridge'

/**
 * 设置页。
 *
 * 采用 Telegram 的分组列表范式：副背景色页面 + 白底圆角分组容器 +
 * 满宽可点行。规格见设计文档 §4.6。
 */
export function SettingsPage() {
  const [version, setVersion] = useState('…')
  const [checking, setChecking] = useState(false)
  const push = useNavStore((s) => s.push)
  const backgroundId = useSettingsStore((s) => s.chatBackgroundId)

  useEffect(() => {
    void getAppVersion().then(setVersion)
  }, [])

  /**
   * 手动检查更新。
   *
   * 与冷启动的静默检查相对：手动触发**必须给反馈**（设计文档 §9.2），
   * 所以三种结果都要有明确回应。
   */
  const onCheck = async (): Promise<void> => {
    setChecking(true)
    const result = await manualCheckForUpdate()
    setChecking(false)

    switch (result.kind) {
      case 'update':
        // 更新卡片是发到消息页的，直接把用户带过去，而不是只弹个提示
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
        <h2 className="list-group__title">关于</h2>

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
    </ScreenShell>
  )
}
