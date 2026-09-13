import { useEffect, useState } from 'react'

import InfoIcon from '@/assets/icons/information-line.svg?react'
import RefreshIcon from '@/assets/icons/refresh-line.svg?react'
import { ListItem } from '@/components/ListItem'
import { ScreenShell } from '@/components/ScreenShell'
import { showToast } from '@/components/toastStore'
import { getAppVersion } from '@/settings/version'

/**
 * 设置页。
 *
 * 采用 Telegram 的分组列表范式：副背景色页面 + 白底圆角分组容器 +
 * 满宽可点行。规格见设计文档 §4.6。
 */
export function SettingsPage() {
  const [version, setVersion] = useState('…')

  useEffect(() => {
    void getAppVersion().then(setVersion)
  }, [])

  return (
    <ScreenShell title="设置" bodyClassName="screen-body--muted">
      <section className="list-group">
        <h2 className="list-group__title">关于</h2>

        <div className="list-group__body">
          <ListItem icon={<InfoIcon />} title="版本" value={version} />

          <ListItem
            icon={<RefreshIcon />}
            title="检查更新"
            chevron
            // TODO: 接入更新模块（见 .claude_dist/设计文档/capacitor-android-update/）
            onClick={() => showToast('检查更新：尚未接入')}
          />
        </div>
      </section>
    </ScreenShell>
  )
}
