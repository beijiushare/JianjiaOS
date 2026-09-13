package com.jianjia.os;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // ⚠️ 必须在 super.onCreate() 之前注册。
        // 放在之后插件不会被注册，JS 侧调用报 "not implemented"，
        // 且错误会被 UI 吞掉，极难排查。
        registerPlugin(ApkUpdaterPlugin.class);

        super.onCreate(savedInstanceState);
    }
}
