package com.mutualaid.common.enums;

import java.util.HashMap;
import java.util.Map;

public enum CourierCodeEnum {
    SHUNFENG("顺丰快递", "shunfeng"),
    YUANTONG("圆通快递", "yuantong"),
    ZHONGTONG("中通快递", "zhongtong"),
    YUNDA("韵达快递", "yunda"),
    SHENTONG("申通快递", "shentong"),
    JD("京东快递", "jd"),
    EMS("EMS", "ems"),
    YOUZHENG("邮政快递", "youzhengguonei"),
    TIANTIAN("天天快递", "tiantian"),
    ZHONGTONG_KUAIDI("中通快运", "zhongtongkuaiyun"),
    DEBANG("德邦快递", "debangkuaidi"),
    YUANDA("圆通速递", "yuantong"),
    BAISHI("百世快递", "baishiwuliu"),
    ZHAIJISONG("宅急送", "zhaijisong"),
    FENGDA("丰达快递", "fengda"),
    DANGSHANG("当当", "dangdang"),
    SHENGDA("晟邦物流", "shengbang"),
    FEDEX("FedEx", "fedex"),
    DHL("DHL", "dhl");

    private final String chineseName;
    private final String kd100Code;

    private static final Map<String, String> CHINESE_TO_CODE = new HashMap<>();
    private static final Map<String, String> CODE_TO_CHINESE = new HashMap<>();

    static {
        for (CourierCodeEnum c : values()) {
            CHINESE_TO_CODE.put(c.chineseName, c.kd100Code);
            CODE_TO_CHINESE.put(c.kd100Code, c.chineseName);
        }
    }

    CourierCodeEnum(String chineseName, String kd100Code) {
        this.chineseName = chineseName;
        this.kd100Code = kd100Code;
    }

    public String getChineseName() {
        return chineseName;
    }

    public String getKd100Code() {
        return kd100Code;
    }

    public static String getCode(String chineseName) {
        return CHINESE_TO_CODE.getOrDefault(chineseName, null);
    }

    public static String getChineseName(String code) {
        return CODE_TO_CHINESE.getOrDefault(code, code);
    }
}
