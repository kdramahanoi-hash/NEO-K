import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    startTransition,
} from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

// Ported from the approved K-DRAMA Hanoi Orange Edition Framer component.
// Design, copy, typography and interactions are retained; no Framer runtime is required.
import { siteDefaults } from "./config"

type Lang = "ko" | "zh" | "en" | "vi"
type MenuTab = "cafe" | "seafood"
type ExperienceTab = "day" | "night"
type CopyStatus = "idle" | "ok" | "fail"
type ErrorCode = "required" | "invalidGuests" | "futureTime" | "invalidEmail"

interface DictShape {
    [key: string]: any
}

interface MyComponentProps {
    languageLocked?: boolean
    style?: React.CSSProperties
    backgroundColor: string
    textColor: string
    accentColor: string
    heroNightImage: string
    coffeeImage: string
    facadeImage: string
    waffleImage: string
    seafoodImage: string
    address: string
    phoneDisplay: string
    phoneLink: string
    zaloUrl: string
    companyUrl: string
    initialLanguage: Lang
    translationsJson: string
    bodyFont: any
    buttonFont: any
}

const defaultDict: Record<Lang, DictShape> = {
    ko: {
        langLabel: "한국어",
        nav: { menu: "메뉴", location: "위치", franchise: "가맹" },
        tiny: "CAFÉ & BOILING SEAFOOD",
        reserve: "예약",
        hero: {
            l1: "GOOD COFFEE.",
            l2: "GREAT SEAFOOD.",
            l3: "LATE TALKS.",
            subtitle: "낮에는 카페, 저녁에는 보일링 시푸드.",
            city: "HANOI, VIETNAM",
            reserve: "예약하기",
            viewMenu: "메뉴 보기",
        },
        quick: {
            title: "편하게 예약하고,\n맛있게 즐기세요.",
            subtitle: "날짜와 시간을 선택해 주세요.",
            date: "방문 날짜",
            time: "방문 시간",
            guests: "인원",
            button: "예약하기",
        },
        editorial: {
            heading: "낮과 밤, 두 가지 즐거움.",
            intro: "커피 한 잔부터 함께 나누는 보일링 시푸드까지.",
            dayTitle: "카페 메뉴",
            nightTitle: "보일링 시푸드",
            dayDesc: "커피 한 잔과 여유로운 낮.",
            nightDesc: "함께 나누는 풍성한 해산물 한 상.",
            dayLink: "카페 메뉴 보기",
            nightLink: "시푸드 메뉴 보기",
            menuLink: "메뉴 보기",
        },
        location: {
            title: "오늘, K-DRAMA에서 만나요.",
            addressLabel: "주소",
            contactLabel: "연락처",
            map: "길찾기",
            zalo: "Zalo 문의",
        },
        franchise: {
            title: "다음 K-DRAMA를 함께.",
            body: "하노이에서 시작하는 카페 & 보일링 시푸드 브랜드.",
            cta: "가맹 상담",
        },
        footer: { brand: "A BRAND OF NEO K CULTURE", zaloBubble: "Zalo 상담" },
        menuDialog: {
            title: "메뉴",
            tabs: { cafe: "카페", seafood: "보일링 시푸드" },
            cafeDesc: "향 좋은 커피와 와플을 편하게 즐겨보세요.",
            seafoodDesc: "함께 나눠 먹기 좋은 보일링 시푸드를 준비했습니다.",
            close: "메뉴 닫기",
        },
        reservation: {
            title: "예약 요청 작성",
            note: "예약 내용을 복사해 Zalo로 보내주세요. 매장 확인 후 예약이 확정됩니다.",
            name: "이름",
            contact: "연락 전화 또는 Zalo",
            date: "방문 날짜",
            time: "방문 시간",
            guests: "인원",
            notes: "메모 (선택)",
            submit: "예약 내용 복사 후 Zalo 열기",
            copyAgain: "요약 다시 복사",
            statusOk:
                "복사되었습니다. Zalo에 붙여넣고 직접 전송하세요. 매장 확인이 필요합니다.",
            statusFail:
                "아래 텍스트를 선택/복사해 Zalo에 붙여넣으세요. 아무 것도 전송되지 않았습니다.",
            summaryTitle: "예약 요약",
            openZalo: "Zalo 열기",
        },
        franchiseForm: {
            title: "가맹 문의 작성",
            note: "문의 내용은 자동 전송되지 않습니다. 복사 후 직접 전달해 주세요.",
            name: "이름",
            contact: "연락처 (전화 / 이메일 / Zalo)",
            city: "도시/상권",
            timing: "예상 오픈 시점",
            message: "메시지",
            submit: "문의 내용 복사 후 Zalo 열기",
            copyAgain: "요약 다시 복사",
            summaryTitle: "가맹 문의 요약",
        },
        fields: {
            required: "필수 입력 항목입니다.",
            invalidGuests: "인원은 1명 이상의 정수여야 합니다.",
            futureTime: "방문 일시는 하노이 현재 시간 이후여야 합니다.",
            invalidEmail: "유효한 이메일 형식을 입력해 주세요.",
            close: "닫기",
            mobileMenu: "모바일 메뉴 열기",
            languageSwitch: "언어 전환",
            languageMenu: "언어 선택 열기",
            next: "다음",
            back: "이전",
            step: "단계",
        },
        phoneDock: { menu: "메뉴", reserve: "예약", zalo: "Zalo" },
        mobileExperience: {
            day: "데이 카페",
            night: "나이트 시푸드",
            askPrice: "오늘의 구성과 가격은 매장에 문의해 주세요.",
        },
        stepNames: { details: "날짜/시간/인원", contact: "연락 정보" },
        aria: { experienceTabs: "데이/나이트 탭", phoneDock: "하단 도크" },
        menuItems: {
            askPrice: "오늘의 구성과 가격은 매장에 문의해 주세요.",
            inquiry: "Zalo로 문의하기",
            reserveFromMenu: "이 메뉴로 예약하기",
            cafe: [
                { name: "제주 말차 라떼", price: "55.000₫" },
                { name: "유자차", price: "45.000₫" },
                { name: "달고나 커피", price: "50.000₫" },
                { name: "클래식 김밥", price: "45.000₫" },
                { name: "떡볶이 (순한맛/매운맛)", price: "60.000₫" },
            ],
        },
        alts: {
            heroSeafood: "K-DRAMA 하노이 보일링 시푸드 플래터",
            coffee: "K-DRAMA 카페 커피",
            facade: "K-DRAMA 하노이 매장 전경",
            waffle: "K-DRAMA 카페 와플",
            seafoodDetail: "K-DRAMA 보일링 시푸드",
        },
    },
    zh: {
        langLabel: "中文",
        nav: { menu: "菜单", location: "位置", franchise: "加盟" },
        tiny: "CAFÉ & BOILING SEAFOOD",
        reserve: "预订",
        hero: {
            l1: "GOOD COFFEE.",
            l2: "GREAT SEAFOOD.",
            l3: "LATE TALKS.",
            subtitle: "白天是咖啡馆，夜晚是手抓海鲜。",
            city: "HANOI, VIETNAM",
            reserve: "立即预订",
            viewMenu: "查看菜单",
        },
        quick: {
            title: "轻松订位，\n尽享美味。",
            subtitle: "请选择到店日期和时间。",
            date: "到店日期",
            time: "到店时间",
            guests: "用餐人数",
            button: "立即订位",
        },
        editorial: {
            heading: "白天与夜晚，两种美好滋味。",
            intro: "从一杯咖啡，到与亲友共享的海鲜盛宴。",
            dayTitle: "咖啡菜单",
            nightTitle: "手抓海鲜",
            dayDesc: "一杯咖啡，悠享白日时光。",
            nightDesc: "丰盛海鲜，与亲友一起分享。",
            dayLink: "查看咖啡菜单",
            nightLink: "查看海鲜菜单",
            menuLink: "查看菜单",
        },
        location: {
            title: "相约 K-DRAMA。",
            addressLabel: "地址",
            contactLabel: "联系电话",
            map: "路线导航",
            zalo: "Zalo 咨询",
        },
        franchise: {
            title: "一起打造下一家 K-DRAMA。",
            body: "一个诞生于河内的咖啡与手抓海鲜品牌。",
            cta: "加盟咨询",
        },
        footer: { brand: "A BRAND OF NEO K CULTURE", zaloBubble: "Zalo 咨询" },
        menuDialog: {
            title: "菜单",
            tabs: { cafe: "咖啡馆", seafood: "手抓海鲜" },
            cafeDesc: "香气咖啡配上华夫饼，适合慢慢享受。",
            seafoodDesc: "热腾腾的海鲜，最适合一起分享。",
            close: "关闭菜单",
        },
        reservation: {
            title: "填写预订请求",
            note: "请复制预约内容并发送到 Zalo。门店确认后才算预约成功。",
            name: "姓名",
            contact: "联系电话或 Zalo",
            date: "到店日期",
            time: "到店时间",
            guests: "人数",
            notes: "备注（可选）",
            submit: "复制预订内容并打开 Zalo",
            copyAgain: "再次复制摘要",
            statusOk: "已复制。请粘贴到 Zalo 并自行发送。需门店确认。",
            statusFail: "请选中/复制下方文字并粘贴到 Zalo。尚未发送任何内容。",
            summaryTitle: "预订摘要",
            openZalo: "打开 Zalo",
        },
        franchiseForm: {
            title: "填写加盟咨询",
            note: "咨询内容不会自动发送，请复制后手动提交。",
            name: "姓名",
            contact: "联系方式（电话 / 邮箱 / Zalo）",
            city: "城市/区域",
            timing: "计划开业时间",
            message: "留言",
            submit: "复制咨询内容并打开 Zalo",
            copyAgain: "再次复制摘要",
            summaryTitle: "加盟咨询摘要",
        },
        fields: {
            required: "此项为必填。",
            invalidGuests: "人数必须是大于 0 的整数。",
            futureTime: "到店时间必须晚于河内当前时间。",
            invalidEmail: "请输入有效邮箱。",
            close: "关闭",
            mobileMenu: "打开移动菜单",
            languageSwitch: "切换语言",
            languageMenu: "打开语言选择",
            next: "下一步",
            back: "返回",
            step: "步骤",
        },
        phoneDock: { menu: "菜单", reserve: "预订", zalo: "Zalo" },
        mobileExperience: {
            day: "日间咖啡",
            night: "夜间海鲜",
            askPrice: "当天海鲜内容与价格请咨询门店。",
        },
        stepNames: { details: "日期与人数", contact: "联系信息" },
        aria: { experienceTabs: "日间/夜间标签", phoneDock: "底部操作栏" },
        menuItems: {
            askPrice: "当天海鲜内容与价格请咨询门店。",
            inquiry: "通过 Zalo 咨询",
            reserveFromMenu: "用此菜单预订",
            cafe: [
                { name: "济州抹茶拿铁", price: "55.000₫" },
                { name: "柚子茶", price: "45.000₫" },
                { name: "达尔戈纳咖啡", price: "50.000₫" },
                { name: "经典紫菜包饭", price: "45.000₫" },
                { name: "辣炒年糕（微辣/辣）", price: "60.000₫" },
            ],
        },
        alts: {
            heroSeafood: "K-DRAMA 河内手抓海鲜拼盘",
            coffee: "K-DRAMA 咖啡",
            facade: "K-DRAMA 河内门店外立面",
            waffle: "K-DRAMA 华夫饼",
            seafoodDetail: "K-DRAMA 手抓海鲜",
        },
    },
    en: {
        langLabel: "EN",
        nav: { menu: "Menu", location: "Location", franchise: "Franchise" },
        tiny: "CAFÉ & BOILING SEAFOOD",
        reserve: "Reservation",
        hero: {
            l1: "GOOD COFFEE.",
            l2: "GREAT SEAFOOD.",
            l3: "LATE TALKS.",
            subtitle: "Cafe by day, boiling seafood by night.",
            city: "HANOI, VIETNAM",
            reserve: "Reserve",
            viewMenu: "View Menu",
        },
        quick: {
            title: "Book your table.\nEnjoy the feast.",
            subtitle: "Choose your date and time.",
            date: "Visit date",
            time: "Visit time",
            guests: "Guests",
            button: "Book a table",
        },
        editorial: {
            heading: "Two moods. One destination.",
            intro: "From a cup of coffee to a seafood feast to share.",
            dayTitle: "Café menu",
            nightTitle: "Boiling seafood",
            dayDesc: "Coffee and a moment to unwind.",
            nightDesc: "A generous seafood feast to share.",
            dayLink: "View café menu",
            nightLink: "View seafood menu",
            menuLink: "View menu",
        },
        location: {
            title: "See you at K-DRAMA.",
            addressLabel: "Address",
            contactLabel: "Contact",
            map: "Directions",
            zalo: "Chat on Zalo",
        },
        franchise: {
            title: "Build the next K-DRAMA together.",
            body: "A café and boiling seafood brand, born in Hanoi.",
            cta: "Franchise Inquiry",
        },
        footer: { brand: "A BRAND OF NEO K CULTURE", zaloBubble: "Zalo" },
        menuDialog: {
            title: "Menu",
            tabs: { cafe: "Cafe", seafood: "Boiling Seafood" },
            cafeDesc: "Coffee and waffles made for easy afternoons.",
            seafoodDesc: "Boiling seafood made for sharing around the table.",
            close: "Close menu",
        },
        reservation: {
            title: "Reservation Request",
            note: "Copy your reservation and send it in Zalo. Your booking is confirmed only after the store replies.",
            name: "Name",
            contact: "Contact phone or Zalo",
            date: "Visit date",
            time: "Visit time",
            guests: "Guests",
            notes: "Notes (optional)",
            submit: "Copy reservation & open Zalo",
            copyAgain: "Copy summary again",
            statusOk:
                "Copied. Paste into Zalo and send yourself. Store must confirm.",
            statusFail:
                "Select/copy text below then paste in Zalo. Nothing has been sent.",
            summaryTitle: "Reservation summary",
            openZalo: "Open Zalo",
        },
        franchiseForm: {
            title: "Franchise Inquiry",
            note: "Inquiry content is not automatically sent. Copy and share it manually.",
            name: "Name",
            contact: "Contact (phone / email / Zalo)",
            city: "City / Area",
            timing: "Planned opening timing",
            message: "Message",
            submit: "Copy inquiry & open Zalo",
            copyAgain: "Copy summary again",
            summaryTitle: "Franchise inquiry summary",
        },
        fields: {
            required: "This field is required.",
            invalidGuests: "Guests must be a positive integer.",
            futureTime:
                "Visit date/time must be in the future (Hanoi timezone).",
            invalidEmail: "Please enter a valid email address.",
            close: "Close",
            mobileMenu: "Open mobile menu",
            languageSwitch: "Switch language",
            languageMenu: "Open language selector",
            next: "Next",
            back: "Back",
            step: "Step",
        },
        phoneDock: { menu: "Menu", reserve: "Reserve", zalo: "Zalo" },
        mobileExperience: {
            day: "DAY CAFÉ",
            night: "NIGHT SEAFOOD",
            askPrice: "Ask about today’s selection and price.",
        },
        stepNames: {
            details: "Date, time & guests",
            contact: "Contact details",
        },
        aria: {
            experienceTabs: "Day and night tabs",
            phoneDock: "Bottom dock",
        },
        menuItems: {
            askPrice: "Ask about today’s selection and price.",
            inquiry: "Inquire on Zalo",
            reserveFromMenu: "Reserve from this menu",
            cafe: [
                { name: "Jeju Matcha Latte", price: "55.000₫" },
                { name: "Yuja (Citron) Tea", price: "45.000₫" },
                { name: "Dalgona Coffee", price: "50.000₫" },
                { name: "Classic Kimbap", price: "45.000₫" },
                { name: "Tteokbokki (Mild/Spicy)", price: "60.000₫" },
            ],
        },
        alts: {
            heroSeafood: "K-DRAMA Hanoi boiling seafood platter",
            coffee: "K-DRAMA coffee",
            facade: "K-DRAMA Hanoi storefront",
            waffle: "K-DRAMA waffle",
            seafoodDetail: "K-DRAMA boiling seafood detail",
        },
    },
    vi: {
        langLabel: "VI",
        nav: {
            menu: "Thực đơn",
            location: "Địa điểm",
            franchise: "Nhượng quyền",
        },
        tiny: "CAFÉ & BOILING SEAFOOD",
        reserve: "Đặt bàn",
        hero: {
            l1: "GOOD COFFEE.",
            l2: "GREAT SEAFOOD.",
            l3: "LATE TALKS.",
            subtitle: "Ban ngày cà phê, buổi tối hải sản đậm vị.",
            city: "HANOI, VIETNAM",
            reserve: "Đặt bàn",
            viewMenu: "Xem thực đơn",
        },
        quick: {
            title: "Đặt bàn dễ dàng,\nthưởng thức trọn vị.",
            subtitle: "Chọn ngày và giờ bạn muốn đến.",
            date: "Ngày đến",
            time: "Giờ đến",
            guests: "Số khách",
            button: "Đặt bàn",
        },
        editorial: {
            heading: "Ngày cà phê, đêm hải sản.",
            intro: "Từ ly cà phê thư giãn đến bữa tiệc hải sản cùng nhau.",
            dayTitle: "Thực đơn cà phê",
            nightTitle: "Boiling Seafood",
            dayDesc: "Một ly cà phê, một buổi thư giãn.",
            nightDesc: "Cùng chia sẻ một bữa tiệc hải sản.",
            dayLink: "Xem menu cà phê",
            nightLink: "Xem menu hải sản",
            menuLink: "Xem thực đơn",
        },
        location: {
            title: "Hẹn gặp bạn tại K-DRAMA.",
            addressLabel: "Địa chỉ",
            contactLabel: "Liên hệ",
            map: "Chỉ đường",
            zalo: "Nhắn Zalo",
        },
        franchise: {
            title: "Cùng xây dựng K-DRAMA tiếp theo.",
            body: "Thương hiệu cà phê & boiling seafood bắt đầu từ Hà Nội.",
            cta: "Liên hệ nhượng quyền",
        },
        footer: { brand: "A BRAND OF NEO K CULTURE", zaloBubble: "Zalo" },
        menuDialog: {
            title: "Thực đơn",
            tabs: { cafe: "Cafe", seafood: "Boiling Seafood" },
            cafeDesc: "Cà phê thơm và waffle cho những buổi chiều thư thả.",
            seafoodDesc: "Boiling seafood nóng hổi để cả bàn cùng thưởng thức.",
            close: "Đóng thực đơn",
        },
        reservation: {
            title: "Yêu cầu đặt bàn",
            note: "Hãy sao chép nội dung đặt bàn và gửi qua Zalo. Cửa hàng xác nhận thì đặt bàn mới hoàn tất.",
            name: "Tên",
            contact: "Điện thoại liên hệ hoặc Zalo",
            date: "Ngày đến",
            time: "Giờ đến",
            guests: "Số khách",
            notes: "Ghi chú (tuỳ chọn)",
            submit: "Sao chép đặt bàn & mở Zalo",
            copyAgain: "Sao chép lại tóm tắt",
            statusOk:
                "Đã sao chép. Dán vào Zalo và tự gửi. Cửa hàng phải xác nhận.",
            statusFail:
                "Hãy chọn/sao chép nội dung bên dưới rồi dán vào Zalo. Chưa có gì được gửi.",
            summaryTitle: "Tóm tắt đặt bàn",
            openZalo: "Mở Zalo",
        },
        franchiseForm: {
            title: "Yêu cầu nhượng quyền",
            note: "Nội dung không tự động gửi, vui lòng sao chép và gửi thủ công.",
            name: "Tên",
            contact: "Liên hệ (điện thoại / email / Zalo)",
            city: "Thành phố / Khu vực",
            timing: "Thời điểm mở dự kiến",
            message: "Nội dung",
            submit: "Sao chép yêu cầu & mở Zalo",
            copyAgain: "Sao chép lại tóm tắt",
            summaryTitle: "Tóm tắt nhượng quyền",
        },
        fields: {
            required: "Trường này là bắt buộc.",
            invalidGuests: "Số khách phải là số nguyên dương.",
            futureTime: "Ngày/giờ đến phải sau thời điểm hiện tại tại Hà Nội.",
            invalidEmail: "Vui lòng nhập email hợp lệ.",
            close: "Đóng",
            mobileMenu: "Mở menu di động",
            languageSwitch: "Chuyển ngôn ngữ",
            languageMenu: "Mở chọn ngôn ngữ",
            next: "Tiếp",
            back: "Quay lại",
            step: "Bước",
        },
        phoneDock: { menu: "Thực đơn", reserve: "Đặt bàn", zalo: "Zalo" },
        mobileExperience: {
            day: "Cà phê ban ngày",
            night: "Hải sản ban đêm",
            askPrice: "Vui lòng hỏi món hải sản trong ngày và giá.",
        },
        stepNames: {
            details: "Ngày giờ & số khách",
            contact: "Thông tin liên hệ",
        },
        aria: {
            experienceTabs: "Tab ngày và đêm",
            phoneDock: "Thanh dock dưới",
        },
        menuItems: {
            askPrice: "Vui lòng hỏi món hải sản trong ngày và giá.",
            inquiry: "Hỏi qua Zalo",
            reserveFromMenu: "Đặt bàn từ menu này",
            cafe: [
                { name: "Jeju Matcha Latte", price: "55.000₫" },
                { name: "Trà Yuja (Thanh yên)", price: "45.000₫" },
                { name: "Cà phê Dalgona", price: "50.000₫" },
                { name: "Kimbap truyền thống", price: "45.000₫" },
                { name: "Tteokbokki (Vị nhẹ/Cay)", price: "60.000₫" },
            ],
        },
        alts: {
            heroSeafood: "Mâm boiling seafood K-DRAMA Hà Nội",
            coffee: "Cà phê K-DRAMA",
            facade: "Mặt tiền K-DRAMA Hà Nội",
            waffle: "Waffle K-DRAMA",
            seafoodDetail: "Chi tiết boiling seafood K-DRAMA",
        },
    },
}

const hanoiTz = "Asia/Ho_Chi_Minh"

function toHanoiNowKey() {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: hanoiTz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(new Date())
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00"
    return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`
}

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function deepMerge(base: DictShape, patch: DictShape): DictShape {
    const output: DictShape = { ...base }
    Object.keys(patch || {}).forEach((key) => {
        const b = base?.[key]
        const p = patch?.[key]
        output[key] =
            b &&
            p &&
            typeof b === "object" &&
            typeof p === "object" &&
            !Array.isArray(b) &&
            !Array.isArray(p)
                ? deepMerge(b, p)
                : p
    })
    return output
}

function applyLegacyCopyMigration(parsed: DictShape): DictShape {
    const next: DictShape = { ...parsed }
    const replaceIfLegacy = (
        lang: Lang,
        path: string[],
        legacy: string,
        updated: string
    ) => {
        let parent: any = next?.[lang]
        for (let i = 0; i < path.length - 1; i += 1) {
            parent = parent?.[path[i]]
            if (!parent) return
        }
        const key = path[path.length - 1]
        if (parent?.[key] === legacy) parent[key] = updated
    }
    replaceIfLegacy(
        "ko",
        ["editorial", "dayDesc"],
        "낮에는 커피와 디저트를 중심으로 차분한 시간을 제안합니다.",
        "좋은 커피와 여유로운 순간."
    )
    replaceIfLegacy(
        "ko",
        ["editorial", "nightDesc"],
        "저녁에는 보일링 시푸드와 함께 활기 있는 식탁을 만듭니다.",
        "보일링 시푸드와 함께하는 특별한 저녁."
    )
    replaceIfLegacy(
        "ko",
        ["location", "title"],
        "하노이에서 당신의 테이블을 찾으세요.",
        "오늘, K-DRAMA에서 만나요."
    )
    replaceIfLegacy(
        "ko",
        ["franchise", "body"],
        "카페와 보일링 시푸드를 결합한 공간 모델의 확장을 위한 제안을 기다립니다.",
        "하노이에서 시작하는 카페 & 보일링 시푸드 브랜드."
    )
    replaceIfLegacy(
        "ko",
        ["reservation", "note"],
        "아래 내용은 자동 전송되지 않습니다. 복사 후 직접 Zalo로 보내고 매장 확인을 받아주세요.",
        "예약 내용을 복사해 Zalo로 보내주세요. 매장 확인 후 예약이 확정됩니다."
    )
    replaceIfLegacy(
        "en",
        ["editorial", "dayDesc"],
        "Daytime is focused on coffee and desserts in a calm editorial setting.",
        "Good coffee. A moment to slow down."
    )
    replaceIfLegacy(
        "en",
        ["editorial", "nightDesc"],
        "Evening shifts to boiling seafood and lively shared tables.",
        "Boiling seafood, shared with good company."
    )
    replaceIfLegacy(
        "en",
        ["location", "title"],
        "Find your table in Hanoi.",
        "See you at K-DRAMA today."
    )
    replaceIfLegacy(
        "en",
        ["franchise", "body"],
        "We welcome practical expansion inquiries for a combined cafe and boiling seafood format.",
        "A café and boiling seafood brand, born in Hanoi."
    )
    replaceIfLegacy(
        "en",
        ["reservation", "note"],
        "Nothing is sent automatically. Copy and paste into Zalo yourself, then wait for store confirmation.",
        "Copy your reservation and send it in Zalo. Your booking is confirmed only after the store replies."
    )
    replaceIfLegacy(
        "vi",
        ["hero", "subtitle"],
        "Ban ngày là cafe, buổi tối là boiling seafood.",
        "Ban ngày cà phê, buổi tối hải sản đậm vị."
    )
    replaceIfLegacy(
        "ko",
        ["quick", "title"],
        "빠른 예약",
        "편하게 예약하고,\n맛있게 즐기세요."
    )
    replaceIfLegacy("ko", ["quick", "date"], "날짜", "방문 날짜")
    replaceIfLegacy("ko", ["quick", "time"], "시간", "방문 시간")
    replaceIfLegacy("ko", ["quick", "button"], "예약 정보 입력", "예약하기")
    replaceIfLegacy("ko", ["editorial", "dayTitle"], "DAY · CAFÉ", "카페 메뉴")
    replaceIfLegacy(
        "ko",
        ["editorial", "nightTitle"],
        "NIGHT · BOILING SEAFOOD",
        "보일링 시푸드"
    )
    replaceIfLegacy(
        "ko",
        ["editorial", "dayDesc"],
        "좋은 커피와 여유로운 순간.",
        "커피 한 잔과 여유로운 낮."
    )
    replaceIfLegacy(
        "ko",
        ["editorial", "nightDesc"],
        "보일링 시푸드와 함께하는 특별한 저녁.",
        "함께 나누는 풍성한 해산물 한 상."
    )
    replaceIfLegacy("ko", ["editorial", "menuLink"], "메뉴 열기", "메뉴 보기")
    replaceIfLegacy("ko", ["location", "map"], "지도 열기", "길찾기")
    replaceIfLegacy("ko", ["location", "zalo"], "Zalo 열기", "Zalo 문의")
    replaceIfLegacy(
        "zh",
        ["quick", "title"],
        "快速预订",
        "轻松订位，\n尽享美味。"
    )
    replaceIfLegacy("zh", ["quick", "date"], "日期", "到店日期")
    replaceIfLegacy("zh", ["quick", "time"], "时间", "到店时间")
    replaceIfLegacy("zh", ["quick", "guests"], "人数", "用餐人数")
    replaceIfLegacy("zh", ["quick", "button"], "填写预订", "立即订位")
    replaceIfLegacy("zh", ["editorial", "dayTitle"], "DAY · CAFÉ", "咖啡菜单")
    replaceIfLegacy(
        "zh",
        ["editorial", "nightTitle"],
        "NIGHT · BOILING SEAFOOD",
        "手抓海鲜"
    )
    replaceIfLegacy(
        "zh",
        ["editorial", "dayDesc"],
        "好咖啡，慢一点的片刻。",
        "一杯咖啡，悠享白日时光。"
    )
    replaceIfLegacy(
        "zh",
        ["editorial", "nightDesc"],
        "和好朋友一起分享手抓海鲜。",
        "丰盛海鲜，与亲友一起分享。"
    )
    replaceIfLegacy("zh", ["editorial", "menuLink"], "打开菜单", "查看菜单")
    replaceIfLegacy(
        "zh",
        ["location", "title"],
        "今天，在 K-DRAMA 见。",
        "相约 K-DRAMA。"
    )
    replaceIfLegacy("zh", ["location", "contactLabel"], "联系", "联系电话")
    replaceIfLegacy("zh", ["location", "map"], "打开地图", "路线导航")
    replaceIfLegacy("zh", ["location", "zalo"], "打开 Zalo", "Zalo 咨询")
    replaceIfLegacy(
        "en",
        ["quick", "title"],
        "Quick Booking",
        "Book your table.\nEnjoy the feast."
    )
    replaceIfLegacy("en", ["quick", "date"], "Date", "Visit date")
    replaceIfLegacy("en", ["quick", "time"], "Time", "Visit time")
    replaceIfLegacy(
        "en",
        ["quick", "button"],
        "Complete Reservation",
        "Book a table"
    )
    replaceIfLegacy("en", ["editorial", "dayTitle"], "DAY · CAFÉ", "Café menu")
    replaceIfLegacy(
        "en",
        ["editorial", "nightTitle"],
        "NIGHT · BOILING SEAFOOD",
        "Boiling seafood"
    )
    replaceIfLegacy(
        "en",
        ["editorial", "dayDesc"],
        "Good coffee. A moment to slow down.",
        "Coffee and a moment to unwind."
    )
    replaceIfLegacy(
        "en",
        ["editorial", "nightDesc"],
        "Boiling seafood, shared with good company.",
        "A generous seafood feast to share."
    )
    replaceIfLegacy("en", ["editorial", "menuLink"], "Open Menu", "View menu")
    replaceIfLegacy(
        "en",
        ["location", "title"],
        "See you at K-DRAMA today.",
        "See you at K-DRAMA."
    )
    replaceIfLegacy("en", ["location", "map"], "Open Map", "Directions")
    replaceIfLegacy("en", ["location", "zalo"], "Open Zalo", "Chat on Zalo")
    replaceIfLegacy(
        "vi",
        ["quick", "title"],
        "Đặt nhanh",
        "Đặt bàn dễ dàng,\nthưởng thức trọn vị."
    )
    replaceIfLegacy("vi", ["quick", "date"], "Ngày", "Ngày đến")
    replaceIfLegacy("vi", ["quick", "time"], "Giờ", "Giờ đến")
    replaceIfLegacy("vi", ["quick", "button"], "Điền đặt bàn", "Đặt bàn")
    replaceIfLegacy(
        "vi",
        ["editorial", "dayTitle"],
        "DAY · CAFÉ",
        "Thực đơn cà phê"
    )
    replaceIfLegacy(
        "vi",
        ["editorial", "nightTitle"],
        "NIGHT · BOILING SEAFOOD",
        "Boiling Seafood"
    )
    replaceIfLegacy(
        "vi",
        ["editorial", "dayDesc"],
        "Cà phê ngon, một khoảnh khắc chậm lại.",
        "Một ly cà phê, một buổi thư giãn."
    )
    replaceIfLegacy(
        "vi",
        ["editorial", "nightDesc"],
        "Boiling seafood để cùng nhau quây quần.",
        "Cùng chia sẻ một bữa tiệc hải sản."
    )
    replaceIfLegacy(
        "vi",
        ["editorial", "menuLink"],
        "Mở thực đơn",
        "Xem thực đơn"
    )
    replaceIfLegacy(
        "vi",
        ["location", "title"],
        "Hẹn bạn hôm nay tại K-DRAMA.",
        "Hẹn gặp bạn tại K-DRAMA."
    )
    replaceIfLegacy("vi", ["location", "map"], "Mở bản đồ", "Chỉ đường")
    replaceIfLegacy("vi", ["location", "zalo"], "Mở Zalo", "Nhắn Zalo")
    replaceIfLegacy("zh", ["editorial", "nightTitle"], "沸煮海鲜", "手抓海鲜")
    replaceIfLegacy(
        "zh",
        ["franchise", "body"],
        "一个诞生于河内的咖啡与沸煮海鲜品牌。",
        "一个诞生于河内的咖啡与手抓海鲜品牌。"
    )
    return next
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function KDramaHanoi(props: Partial<MyComponentProps> = {}) {
    const {
        style,
        backgroundColor,
        textColor,
        accentColor,
        heroNightImage = "https://www.kdramahanoi.com/assets/store-seafood.jpg",
        coffeeImage = "https://www.kdramahanoi.com/assets/real-coffee.png",
        facadeImage = "https://www.kdramahanoi.com/assets/store-front-v2.jpg",
        waffleImage = "https://www.kdramahanoi.com/assets/store-waffle.png",
        seafoodImage = "https://www.kdramahanoi.com/assets/real-seafood-boil.jpg",
        address,
        phoneDisplay,
        phoneLink,
        zaloUrl,
        companyUrl,
        initialLanguage,
        translationsJson,
        bodyFont,
        buttonFont,
    } = { ...siteDefaults, ...props }
    const isStatic = false
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])
    const rootRef = useRef<HTMLDivElement | null>(null)
    const restoreRef = useRef<HTMLElement | null>(null)
    const menuDialogRef = useRef<HTMLDivElement | null>(null)
    const reservationDialogRef = useRef<HTMLDivElement | null>(null)
    const franchiseDialogRef = useRef<HTMLDivElement | null>(null)
    const langDialogRef = useRef<HTMLDivElement | null>(null)
    const priorBodyOverflowRef = useRef<string>("")
    const menuTabRefs = useRef<Array<HTMLButtonElement | null>>([])
    const experienceTabRefs = useRef<Array<HTMLButtonElement | null>>([])
    const [containerWidth, setContainerWidth] = useState(1360)
    const [mobileNavOpen, setMobileNavOpen] = useState(false)
    const [langSheetOpen, setLangSheetOpen] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [reservationOpen, setReservationOpen] = useState(false)
    const [franchiseOpen, setFranchiseOpen] = useState(false)
    const [menuTab, setMenuTab] = useState<MenuTab>("cafe")
    const [experienceTab, setExperienceTab] = useState<ExperienceTab>("day")
    const [reservationStep, setReservationStep] = useState(1)
    const [lang, setLang] = useState<Lang>(initialLanguage)
    const selectLanguage = useCallback((next: Lang) => {
        setLang(next)
        const url = new URL(window.location.href)
        url.searchParams.set("lang", next)
        window.history.replaceState(null, "", url.pathname + url.search + url.hash)
    }, [])
    const [quickDate, setQuickDate] = useState("")
    const [quickTime, setQuickTime] = useState("")
    const [quickGuests, setQuickGuests] = useState("2")
    const [reservationCopyStatus, setReservationCopyStatus] =
        useState<CopyStatus>("idle")
    const [franchiseCopyStatus, setFranchiseCopyStatus] =
        useState<CopyStatus>("idle")
    const [reservationSubmitted, setReservationSubmitted] = useState(false)
    const [franchiseSubmitted, setFranchiseSubmitted] = useState(false)
    const [reservationErrors, setReservationErrors] = useState<
        Record<string, ErrorCode>
    >({})
    const [franchiseErrors, setFranchiseErrors] = useState<
        Record<string, ErrorCode>
    >({})
    const [reservationForm, setReservationForm] = useState({
        name: "",
        contact: "",
        date: "",
        time: "",
        guests: "2",
        notes: "",
    })
    const [franchiseForm, setFranchiseForm] = useState({
        name: "",
        contact: "",
        city: "",
        timing: "",
        message: "",
    })

    const dict = useMemo(() => {
        try {
            const parsed = applyLegacyCopyMigration(
                JSON.parse(translationsJson)
            )
            const output: DictShape = { ...defaultDict }
            ;(["ko", "zh", "en", "vi"] as Lang[]).forEach(
                (l) =>
                    (output[l] = deepMerge(defaultDict[l], parsed?.[l] ?? {}))
            )
            return output
        } catch {
            return defaultDict
        }
    }, [translationsJson])
    const t = useMemo(() => dict[lang] ?? defaultDict.en, [dict, lang])

    useEffect(() => {
        if (isStatic) {
            startTransition(() => setLang(initialLanguage))
            return
        }
        if (typeof window !== "undefined") {
            const requested = new URLSearchParams(window.location.search).get("lang")
            if (requested && ["ko", "zh", "en", "vi"].includes(requested)) {
                startTransition(() => setLang(requested as Lang))
                return
            }
            if (props.languageLocked) {
                startTransition(() => setLang(initialLanguage))
                return
            }
            try {
                const saved = window.localStorage.getItem("kdrama_hanoi_lang")
                if (saved && ["ko", "zh", "en", "vi"].includes(saved)) {
                    startTransition(() => setLang(saved as Lang))
                    return
                }
            } catch {}
        }
        startTransition(() => setLang(initialLanguage))
    }, [initialLanguage, isStatic, props.languageLocked])

    useEffect(() => {
        if (isStatic || typeof window === "undefined") return
        try {
            window.localStorage.setItem("kdrama_hanoi_lang", lang)
        } catch {}
    }, [lang, isStatic])

    useEffect(() => {
        document.documentElement.lang = lang === "zh" ? "zh-Hans" : lang
        document.title = `K-DRAMA Hanoi | ${t.editorial.nightTitle} & Café`
    }, [lang, t.editorial.nightTitle])

    useEffect(() => {
        if (!rootRef.current || typeof ResizeObserver === "undefined") return
        const ob = new ResizeObserver((entries) =>
            startTransition(() =>
                setContainerWidth(entries[0]?.contentRect.width ?? 1360)
            )
        )
        ob.observe(rootRef.current)
        return () => ob.disconnect()
    }, [])

    useEffect(() => {
        if (typeof document === "undefined") return
        const anyOpen =
            menuOpen || reservationOpen || franchiseOpen || langSheetOpen
        if (!anyOpen) return
        priorBodyOverflowRef.current = document.body.style.overflow
        document.body.style.overflow = "hidden"
        return () => {
            document.body.style.overflow = priorBodyOverflowRef.current
        }
    }, [menuOpen, reservationOpen, franchiseOpen, langSheetOpen])

    useEffect(() => {
        if (!mobileNavOpen || typeof document === "undefined") return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault()
                startTransition(() => setMobileNavOpen(false))
            }
        }
        document.addEventListener("keydown", onKey)
        return () => document.removeEventListener("keydown", onKey)
    }, [mobileNavOpen])

    const isMobile = containerWidth < 760
    const isPhone = containerWidth < 810
    const isCompactNav = containerWidth < 1050
    const reduceMotion = useReducedMotion()
    const canUseFixed = mounted && typeof window !== "undefined"
    const maxWrap = { margin: 0, width: "100%", minWidth: 0 }
    const localeFontFamily = useMemo(() => {
        if (lang === "ko") return "'Noto Sans KR','Noto Sans',sans-serif"
        if (lang === "zh") return "'Noto Sans SC','Noto Sans',sans-serif"
        return "'Noto Sans','Noto Sans KR','Noto Sans SC',sans-serif"
    }, [lang])
    const uiFont = localeFontFamily
    const mapsHref = useMemo(
        () =>
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
        [address]
    )
    const minHanoiDate = useMemo(() => toHanoiNowKey().split("T")[0], [])
    const heroPad = isMobile ? 20 : containerWidth < 1100 ? 32 : 48
    const heroFontSize = isPhone
        ? Math.max(40, Math.min(48, containerWidth * 0.13))
        : Math.max(50, Math.min(132, containerWidth * 0.068))
    const labelStyle: React.CSSProperties = {
        display: "block",
        fontSize: 15,
        fontWeight: 700,
        lineHeight: 1.4,
        letterSpacing: "-0.01em",
        marginBottom: 6,
    }
    const inputStyle: React.CSSProperties = {
        width: "100%",
        border: `1px solid ${textColor}`,
        background: backgroundColor,
        color: textColor,
        padding: "12px 10px",
        fontFamily: uiFont,
        fontSize: 17,
        lineHeight: 1.5,
        fontWeight: 600,
    }
    const bodyTextStyle: React.CSSProperties = {
        fontFamily: uiFont,
        fontSize: isPhone ? 16 : 18,
        lineHeight: 1.6,
        fontWeight: 500,
    }
    const ctaTextStyle: React.CSSProperties = {
        fontFamily: uiFont,
        fontSize: isPhone ? 16 : 17,
        lineHeight: 1.4,
        fontWeight: 800,
        letterSpacing: "-0.01em",
    }

    const reservationSummary = useMemo(
        () =>
            `${t.reservation.summaryTitle}\n${t.reservation.name}: ${reservationForm.name}\n${t.reservation.contact}: ${reservationForm.contact}\n${t.reservation.date}: ${reservationForm.date}\n${t.reservation.time}: ${reservationForm.time}\n${t.reservation.guests}: ${reservationForm.guests}\n${t.reservation.notes}: ${reservationForm.notes || "-"}\n${t.location.addressLabel}: ${address}\n${t.location.contactLabel}: ${phoneDisplay}`,
        [t, reservationForm, address, phoneDisplay]
    )
    const franchiseSummary = useMemo(
        () =>
            `${t.franchiseForm.summaryTitle}\n${t.franchiseForm.name}: ${franchiseForm.name}\n${t.franchiseForm.contact}: ${franchiseForm.contact}\n${t.franchiseForm.city}: ${franchiseForm.city}\n${t.franchiseForm.timing}: ${franchiseForm.timing}\n${t.franchiseForm.message}: ${franchiseForm.message}`,
        [t, franchiseForm]
    )

    const errorText = useCallback(
        (code?: ErrorCode) =>
            code === "required"
                ? t.fields.required
                : code === "invalidGuests"
                  ? t.fields.invalidGuests
                  : code === "futureTime"
                    ? t.fields.futureTime
                    : code === "invalidEmail"
                      ? t.fields.invalidEmail
                      : "",
        [t.fields]
    )

    const openDialog = useCallback(
        (setter: (v: boolean) => void, trigger?: HTMLElement | null) => {
            restoreRef.current =
                trigger ??
                (typeof document !== "undefined"
                    ? (document.activeElement as HTMLElement)
                    : null)
            startTransition(() => {
                setMenuOpen(false)
                setReservationOpen(false)
                setFranchiseOpen(false)
                setLangSheetOpen(false)
                setter(true)
            })
        },
        []
    )
    const closeDialog = useCallback((setter: (v: boolean) => void) => {
        startTransition(() => setter(false))
        requestAnimationFrame(() => {
            if (
                restoreRef.current &&
                typeof document !== "undefined" &&
                document.contains(restoreRef.current)
            ) {
                restoreRef.current.focus()
                return
            }
            rootRef.current?.focus()
        })
    }, [])
    const applyQuick = useCallback(() => {
        const readQuick = (field: string, fallback: string) =>
            rootRef.current?.querySelector<HTMLInputElement>(
                "#kd-quick-" + field
            )?.value || fallback
        const date = readQuick("date", quickDate)
        const time = readQuick("time", quickTime)
        const guests = readQuick("guests", quickGuests)
        startTransition(() =>
            setReservationForm((p) => ({
                ...p,
                date: date || p.date,
                time: time || p.time,
                guests: guests || p.guests,
            }))
        )
    }, [quickDate, quickTime, quickGuests])
    const openReservationWithQuick = useCallback(
        (trigger?: HTMLElement | null) => {
            applyQuick()
            startTransition(() => setReservationStep(1))
            openDialog(setReservationOpen, trigger)
        },
        [applyQuick, openDialog, reservationForm, isPhone]
    )

    const getFocusableElements = useCallback(
        (ref: React.RefObject<HTMLDivElement | null>) => {
            if (!ref.current) return [] as HTMLElement[]
            const list = Array.from(
                ref.current.querySelectorAll<HTMLElement>(
                    "button, [href], input, textarea, select, [tabindex]"
                )
            )
            return list.filter((el) => {
                if (el.hasAttribute("disabled")) return false
                if (el.getAttribute("aria-hidden") === "true") return false
                if (el.tabIndex < 0) return false
                return true
            })
        },
        []
    )

    const trapFocus = useCallback(
        (event: KeyboardEvent, ref: React.RefObject<HTMLDivElement | null>) => {
            if (event.key !== "Tab" || !ref.current) return
            const nodes = getFocusableElements(ref)
            if (!nodes.length) return
            const first = nodes[0]
            const last = nodes[nodes.length - 1]
            const active = document.activeElement as HTMLElement
            if (event.shiftKey && active === first) {
                event.preventDefault()
                last.focus()
            } else if (!event.shiftKey && active === last) {
                event.preventDefault()
                first.focus()
            }
        },
        [getFocusableElements]
    )

    useEffect(() => {
        const openMap = [
            {
                open: menuOpen,
                ref: menuDialogRef,
                close: () => closeDialog(setMenuOpen),
            },
            {
                open: reservationOpen,
                ref: reservationDialogRef,
                close: () => closeDialog(setReservationOpen),
            },
            {
                open: franchiseOpen,
                ref: franchiseDialogRef,
                close: () => closeDialog(setFranchiseOpen),
            },
            {
                open: langSheetOpen,
                ref: langDialogRef,
                close: () => closeDialog(setLangSheetOpen),
            },
        ]
        const active = openMap.find((m) => m.open)
        if (!active || typeof document === "undefined") return
        const tm = window.setTimeout(
            () => getFocusableElements(active.ref)[0]?.focus(),
            0
        )
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault()
                active.close()
                return
            }
            trapFocus(e, active.ref)
        }
        document.addEventListener("keydown", onKey)
        return () => {
            window.clearTimeout(tm)
            document.removeEventListener("keydown", onKey)
        }
    }, [
        menuOpen,
        reservationOpen,
        franchiseOpen,
        langSheetOpen,
        closeDialog,
        trapFocus,
        getFocusableElements,
    ])

    const validateReservation = useCallback(() => {
        const e: Record<string, ErrorCode> = {}
        if (!reservationForm.name.trim()) e.name = "required"
        if (!reservationForm.contact.trim()) e.contact = "required"
        if (!reservationForm.date) e.date = "required"
        if (!reservationForm.time) e.time = "required"
        const g = Number(reservationForm.guests)
        if (!Number.isInteger(g) || g < 1) e.guests = "invalidGuests"
        if (
            reservationForm.date &&
            reservationForm.time &&
            `${reservationForm.date}T${reservationForm.time}` <= toHanoiNowKey()
        )
            e.time = "futureTime"
        startTransition(() => setReservationErrors(e))
        return Object.keys(e).length === 0
    }, [reservationForm])
    const validateReservationStep1 = useCallback(() => {
        const e: Record<string, ErrorCode> = {}
        if (!reservationForm.date) e.date = "required"
        if (!reservationForm.time) e.time = "required"
        const g = Number(reservationForm.guests)
        if (!Number.isInteger(g) || g < 1) e.guests = "invalidGuests"
        if (
            reservationForm.date &&
            reservationForm.time &&
            `${reservationForm.date}T${reservationForm.time}` <= toHanoiNowKey()
        )
            e.time = "futureTime"
        startTransition(() =>
            setReservationErrors((prev) => ({
                ...prev,
                date: e.date,
                time: e.time,
                guests: e.guests,
            }))
        )
        return Object.keys(e).length === 0
    }, [reservationForm])
    const validateFranchise = useCallback(() => {
        const e: Record<string, ErrorCode> = {}
        if (!franchiseForm.name.trim()) e.name = "required"
        if (!franchiseForm.contact.trim()) e.contact = "required"
        if (
            franchiseForm.contact.includes("@") &&
            !isValidEmail(franchiseForm.contact)
        )
            e.contact = "invalidEmail"
        if (!franchiseForm.city.trim()) e.city = "required"
        if (!franchiseForm.timing.trim()) e.timing = "required"
        if (!franchiseForm.message.trim()) e.message = "required"
        startTransition(() => setFranchiseErrors(e))
        return Object.keys(e).length === 0
    }, [franchiseForm])

    const copyText = useCallback(async (v: string) => {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
            await navigator.clipboard.writeText(v)
            return true
        }
        return false
    }, [])

    const reservationSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault()
            if (!validateReservation()) {
                const step1Invalid =
                    !reservationForm.date ||
                    !reservationForm.time ||
                    !Number.isInteger(Number(reservationForm.guests)) ||
                    Number(reservationForm.guests) < 1 ||
                    `${reservationForm.date}T${reservationForm.time}` <=
                        toHanoiNowKey()
                if (step1Invalid) startTransition(() => setReservationStep(1))
                return
            }
            startTransition(() => {
                setReservationSubmitted(true)
                setReservationCopyStatus("idle")
            })
            if (typeof window !== "undefined")
                window.open(zaloUrl, "_blank", "noopener,noreferrer")
            try {
                const ok = await copyText(reservationSummary)
                startTransition(() =>
                    setReservationCopyStatus(ok ? "ok" : "fail")
                )
            } catch {
                startTransition(() => setReservationCopyStatus("fail"))
            }
        },
        [
            validateReservation,
            zaloUrl,
            copyText,
            reservationSummary,
            reservationForm,
        ]
    )

    const franchiseSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault()
            if (!validateFranchise()) return
            startTransition(() => {
                setFranchiseSubmitted(true)
                setFranchiseCopyStatus("idle")
            })
            if (typeof window !== "undefined")
                window.open(zaloUrl, "_blank", "noopener,noreferrer")
            try {
                const ok = await copyText(franchiseSummary)
                startTransition(() =>
                    setFranchiseCopyStatus(ok ? "ok" : "fail")
                )
            } catch {
                startTransition(() => setFranchiseCopyStatus("fail"))
            }
        },
        [validateFranchise, zaloUrl, copyText, franchiseSummary]
    )

    const modalRoot = mounted && typeof document !== "undefined" ? document.body : null
    const modal = (
        title: string,
        onClose: () => void,
        ref: React.RefObject<HTMLDivElement | null>,
        content: React.ReactNode
    ) => (
        <div
            lang={lang}
            role="presentation"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.56)",
                zIndex: 1200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
            }}
        >
            <div
                className="kd-portal"
                lang={lang}
                style={{
                    width: "100%",
                    maxWidth: 760,
                    fontFamily: uiFont,
                    fontSize: 16,
                    lineHeight: 1.6,
                    fontWeight: 400,
                }}
            >
                <div
                    ref={ref}
                    lang={lang}
                    className="kd-dialog"
                    role="dialog"
                    aria-modal="true"
                    aria-label={title}
                    style={{
                        width: "100%",
                        maxHeight: "90vh",
                        overflow: "auto",
                        background: backgroundColor,
                        color: textColor,
                        border: `1px solid ${textColor}`,
                        padding: 22,
                        fontFamily: uiFont,
                        fontSize: 16,
                        lineHeight: 1.6,
                        fontWeight: 400,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 16,
                        }}
                    >
                        <h3
                            style={{
                                margin: 0,
                                fontFamily: uiFont,
                                fontWeight: 800,
                                letterSpacing: "-0.01em",
                                fontSize: isMobile ? 24 : 28,
                                lineHeight: 1.2,
                            }}
                        >
                            {title}
                        </h3>
                        <button
                            aria-label={t.fields.close}
                            onClick={onClose}
                            style={{
                                border: `1px solid ${textColor}`,
                                background: "transparent",
                                color: textColor,
                                minHeight: 44,
                                padding: "8px 12px",
                                cursor: "pointer",
                                fontSize: 14,
                                lineHeight: 1.4,
                                fontWeight: 700,
                            }}
                        >
                            {t.fields.close}
                        </button>
                    </div>
                    {content}
                </div>
            </div>
        </div>
    )

    return (
        <div
            className="kd-site"
            ref={rootRef}
            tabIndex={-1}
            lang={lang}
            style={{
                position: "relative",
                width: "100%",
                height: "auto",
                background: backgroundColor,
                color: textColor,
                overflowX: "hidden",
                fontFamily: uiFont,
                ...style,
            }}
        >
            <style>{`.kd-site *, .kd-portal *, .kd-dialog *{box-sizing:border-box}.kd-site button,.kd-dialog button{cursor:pointer}.kd-dialog button,.kd-dialog input,.kd-dialog select,.kd-dialog textarea{font-family:inherit}.kd-site h1,.kd-site h2,.kd-site h3,.kd-dialog h3{font-synthesis:none}.kd-site :focus-visible, .kd-portal :focus-visible{outline:2px solid ${accentColor};outline-offset:2px}.kd-site button,.kd-site a,.kd-site input,.kd-site textarea,.kd-site select,.kd-portal button,.kd-portal a,.kd-portal input,.kd-portal textarea,.kd-portal select{font-family:inherit;font-size:inherit;line-height:inherit;letter-spacing:inherit}`}</style>
            <header
                style={{
                    background: textColor,
                    color: backgroundColor,
                    borderBottom: `1px solid ${accentColor}`,
                    position: isPhone ? "sticky" : "relative",
                    top: isPhone ? 0 : undefined,
                    zIndex: 40,
                }}
            >
                {isPhone ? (
                    <div
                        style={{
                            ...maxWrap,
                            height: 64,
                            padding: "8px 12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <div
                            style={{
                                fontFamily:
                                    "Inter, Noto Sans KR, Noto Sans SC, sans-serif",
                                fontWeight: 800,
                                letterSpacing: "0.04em",
                                fontSize: 28,
                                lineHeight: 1,
                            }}
                        >
                            K-DRAMA
                        </div>
                        <button
                            aria-label={
                                t.fields.languageMenu || t.fields.languageSwitch
                            }
                            onClick={(e) =>
                                openDialog(setLangSheetOpen, e.currentTarget)
                            }
                            style={{
                                minHeight: 48,
                                minWidth: 90,
                                border: `1px solid ${backgroundColor}`,
                                background: "transparent",
                                color: backgroundColor,
                                padding: "0 14px",
                                fontSize: 16,
                                fontWeight: 700,
                            }}
                        >
                            {defaultDict[lang].langLabel}
                        </button>
                    </div>
                ) : (
                    <>
                        <div
                            style={{
                                ...maxWrap,
                                padding: isCompactNav
                                    ? "10px 12px"
                                    : `14px ${heroPad}px`,
                                display: "grid",
                                gridTemplateColumns: isCompactNav
                                    ? "minmax(0,1fr) 44px auto"
                                    : "1fr 1.4fr 1fr",
                                gap: 12,
                                alignItems: "center",
                            }}
                        >
                            <div>
                                <div
                                    style={{
                                        fontFamily:
                                            "Inter, Noto Sans KR, Noto Sans SC, sans-serif",
                                        fontWeight: 800,
                                        letterSpacing: "0.04em",
                                        fontSize: 32,
                                        lineHeight: 1,
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    K-DRAMA
                                </div>
                                <div
                                    style={{
                                        fontSize: isMobile ? 8 : 10,
                                        letterSpacing: "0.16em",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {t.tiny}
                                </div>
                            </div>
                            {isCompactNav ? (
                                <button
                                    onClick={() =>
                                        startTransition(() =>
                                            setMobileNavOpen((v) => !v)
                                        )
                                    }
                                    aria-label={t.fields.mobileMenu}
                                    aria-expanded={mobileNavOpen}
                                    aria-controls="kd-mobile-nav"
                                    style={{
                                        minHeight: 44,
                                        minWidth: 44,
                                        border: `1px solid ${backgroundColor}`,
                                        color: backgroundColor,
                                        background: "transparent",
                                    }}
                                >
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M2 5h16M2 10h16M2 15h16"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                        />
                                    </svg>
                                </button>
                            ) : (
                                <nav
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        gap: 32,
                                    }}
                                >
                                    <button
                                        onClick={(e) =>
                                            openDialog(
                                                setMenuOpen,
                                                e.currentTarget
                                            )
                                        }
                                        style={{
                                            minHeight: 44,
                                            padding: "0 10px",
                                            background: "none",
                                            color: backgroundColor,
                                            border: "none",
                                            cursor: "pointer",
                                            fontSize: 17,
                                            lineHeight: 1.4,
                                            fontWeight: 700,
                                            letterSpacing: "-0.01em",
                                            textTransform: "none",
                                        }}
                                    >
                                        {t.nav.menu}
                                    </button>
                                    <a
                                        href="#location"
                                        style={{
                                            color: backgroundColor,
                                            textDecoration: "none",
                                            minHeight: 44,
                                            padding: "0 10px",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            fontSize: 17,
                                            lineHeight: 1.4,
                                            fontWeight: 700,
                                            letterSpacing: "-0.01em",
                                        }}
                                    >
                                        {t.nav.location}
                                    </a>
                                    <button
                                        onClick={(e) =>
                                            openDialog(
                                                setFranchiseOpen,
                                                e.currentTarget
                                            )
                                        }
                                        style={{
                                            minHeight: 44,
                                            padding: "0 10px",
                                            background: "none",
                                            color: backgroundColor,
                                            border: "none",
                                            cursor: "pointer",
                                            fontSize: 17,
                                            lineHeight: 1.4,
                                            fontWeight: 700,
                                            letterSpacing: "-0.01em",
                                            textTransform: "none",
                                        }}
                                    >
                                        {t.nav.franchise}
                                    </button>
                                </nav>
                            )}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: 8,
                                    alignItems: "center",
                                    flexWrap: "wrap",
                                }}
                            >
                                {!isCompactNav &&
                                    (["ko", "zh", "en", "vi"] as Lang[]).map(
                                        (l) => (
                                            <button
                                                key={l}
                                                aria-label={`${t.fields.languageSwitch} ${defaultDict[l].langLabel}`}
                                                aria-pressed={l === lang}
                                                onClick={() =>
                                                    startTransition(() =>
                                                        selectLanguage(l)
                                                    )
                                                }
                                                style={{
                                                    minHeight: 44,
                                                    background: "none",
                                                    border: "none",
                                                    color:
                                                        l === lang
                                                            ? accentColor
                                                            : backgroundColor,
                                                    cursor: "pointer",
                                                    fontSize: 14,
                                                    lineHeight: 1.4,
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {defaultDict[l].langLabel}
                                            </button>
                                        )
                                    )}
                                <button
                                    onClick={(e) =>
                                        openReservationWithQuick(
                                            e.currentTarget
                                        )
                                    }
                                    style={{
                                        minHeight: 44,
                                        background: accentColor,
                                        border: "none",
                                        borderRadius: 8,
                                        color: "#191C19",
                                        padding: "14px 24px",
                                        cursor: "pointer",
                                        ...ctaTextStyle,
                                        ...ctaTextStyle,
                                    }}
                                >
                                    {t.reserve}
                                </button>
                            </div>
                        </div>
                        {isCompactNav && (
                            <div
                                style={{
                                    ...maxWrap,
                                    padding: "0 12px 10px",
                                    display: "grid",
                                    gap: 8,
                                    gridTemplateColumns: "repeat(4,1fr)",
                                }}
                            >
                                {(["ko", "zh", "en", "vi"] as Lang[]).map(
                                    (l) => (
                                        <button
                                            key={`m-${l}`}
                                            aria-label={`${t.fields.languageSwitch} ${defaultDict[l].langLabel}`}
                                            aria-pressed={l === lang}
                                            onClick={() =>
                                                startTransition(() =>
                                                    selectLanguage(l)
                                                )
                                            }
                                            style={{
                                                minHeight: 44,
                                                background: "none",
                                                border: `1px solid ${backgroundColor}`,
                                                color:
                                                    l === lang
                                                        ? accentColor
                                                        : backgroundColor,
                                                fontSize: 14,
                                                lineHeight: 1.4,
                                                fontWeight: 700,
                                            }}
                                        >
                                            {defaultDict[l].langLabel}
                                        </button>
                                    )
                                )}
                            </div>
                        )}
                    </>
                )}
            </header>

            {!isPhone && isCompactNav && mobileNavOpen && (
                <nav
                    id="kd-mobile-nav"
                    style={{
                        background: textColor,
                        color: backgroundColor,
                        padding: 14,
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                    }}
                >
                    <button
                        onClick={(e) => {
                            openDialog(setMenuOpen, e.currentTarget)
                            startTransition(() => setMobileNavOpen(false))
                        }}
                        style={{
                            minHeight: 44,
                            textAlign: "left",
                            color: backgroundColor,
                            background: "none",
                            border: "none",
                            fontSize: 18,
                            lineHeight: 1.4,
                            fontWeight: 700,
                        }}
                    >
                        {t.nav.menu}
                    </button>
                    <a
                        href="#location"
                        style={{
                            color: backgroundColor,
                            fontSize: 18,
                            lineHeight: 1.4,
                            fontWeight: 700,
                            minHeight: 44,
                            display: "inline-flex",
                            alignItems: "center",
                        }}
                        onClick={() =>
                            startTransition(() => setMobileNavOpen(false))
                        }
                    >
                        {t.nav.location}
                    </a>
                    <button
                        onClick={(e) => {
                            openDialog(setFranchiseOpen, e.currentTarget)
                            startTransition(() => setMobileNavOpen(false))
                        }}
                        style={{
                            minHeight: 44,
                            textAlign: "left",
                            color: backgroundColor,
                            background: "none",
                            border: "none",
                            fontSize: 18,
                            lineHeight: 1.4,
                            fontWeight: 700,
                        }}
                    >
                        {t.nav.franchise}
                    </button>
                </nav>
            )}

            {isPhone ? (
                <>
                    <section
                        style={{
                            position: "relative",
                            minHeight: 450,
                            display: "flex",
                            alignItems: "flex-end",
                            padding: "20px 14px 26px",
                            overflow: "hidden",
                        }}
                    >
                        <img
                            src={heroNightImage}
                            alt={t.alts.heroSeafood}
                            loading="eager"
                            style={{
                                position: "absolute",
                                inset: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                objectPosition: "30% 80%",
                                transform: "scale(1.65)",
                                transformOrigin: "25% 85%",
                            }}
                        />
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                background:
                                    "linear-gradient(180deg, rgba(25,28,25,0.2) 0%, rgba(25,28,25,0.84) 56%, rgba(25,28,25,0.94) 100%)",
                            }}
                        />
                        <div
                            style={{
                                position: "relative",
                                zIndex: 1,
                                color: "#F2F0E6",
                            }}
                        >
                            <h1
                                style={{
                                    margin: 0,
                                    fontFamily: uiFont,
                                    fontWeight: 800,
                                    letterSpacing: "-0.035em",
                                    fontSize: heroFontSize,
                                    lineHeight: 0.98,
                                }}
                            >
                                GOOD COFFEE.
                                <br />
                                GREAT{" "}
                                <span style={{ color: accentColor }}>
                                    SEAFOOD.
                                </span>
                                <br />
                                LATE TALKS.
                            </h1>
                            <p
                                style={{
                                    margin: "12px 0 14px",
                                    fontSize: 16,
                                    lineHeight: 1.6,
                                    ...bodyTextStyle,
                                }}
                            >
                                {t.hero.subtitle}
                            </p>
                            <button
                                onClick={(e) =>
                                    openReservationWithQuick(e.currentTarget)
                                }
                                style={{
                                    minHeight: 48,
                                    border: "none",
                                    background: accentColor,
                                    color: "#191C19",
                                    borderRadius: 10,
                                    padding: "0 20px",
                                    ...ctaTextStyle,
                                }}
                            >
                                {t.hero.reserve}
                            </button>
                        </div>
                    </section>
                </>
            ) : (
                <>
                    <section
                        style={{
                            ...maxWrap,
                            minHeight: isMobile
                                ? "auto"
                                : Math.max(
                                      560,
                                      Math.min(760, containerWidth * 0.42)
                                  ),
                            display: "grid",
                            gridTemplateColumns: isMobile ? "1fr" : "42% 58%",
                        }}
                    >
                        <div
                            style={{
                                position: "relative",
                                zIndex: 2,
                                minWidth: 0,
                                background: textColor,
                                color: backgroundColor,
                                padding: heroPad,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                overflow: "visible",
                            }}
                        >
                            <h1
                                style={{
                                    margin: 0,
                                    width: isMobile ? "100%" : "max-content",
                                    marginRight: isMobile ? 0 : -72,
                                    fontFamily: uiFont,
                                    fontWeight: 800,
                                    letterSpacing: "-0.035em",
                                    fontSize: heroFontSize,
                                    lineHeight: 0.98,
                                    whiteSpace: "nowrap",
                                    position: "relative",
                                    zIndex: 2,
                                }}
                            >
                                <span>GOOD COFFEE.</span>
                                <br />
                                <span>
                                    GREAT{" "}
                                    <span style={{ color: accentColor }}>
                                        SEAFOOD.
                                    </span>
                                </span>
                                <br />
                                <span>LATE TALKS.</span>
                            </h1>
                            <p
                                style={{
                                    margin: "18px 0 4px",
                                    fontSize: 16,
                                    ...bodyTextStyle,
                                }}
                            >
                                {t.hero.subtitle}
                            </p>
                            <div
                                style={{
                                    letterSpacing: "0.12em",
                                    fontSize: 11,
                                    marginBottom: 18,
                                }}
                            >
                                {t.hero.city}
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    gap: 10,
                                    flexWrap: "wrap",
                                }}
                            >
                                <button
                                    onClick={(e) =>
                                        openReservationWithQuick(
                                            e.currentTarget
                                        )
                                    }
                                    style={{
                                        minHeight: 44,
                                        background: accentColor,
                                        color: "#191C19",
                                        border: "none",
                                        borderRadius: 8,
                                        padding: "14px 24px",
                                        ...ctaTextStyle,
                                    }}
                                >
                                    {t.hero.reserve}
                                </button>
                                <button
                                    onClick={(e) =>
                                        openDialog(setMenuOpen, e.currentTarget)
                                    }
                                    style={{
                                        minHeight: 44,
                                        border: "none",
                                        background: "transparent",
                                        color: backgroundColor,
                                        padding: "12px 2px",
                                        textDecoration: "underline",
                                        ...ctaTextStyle,
                                    }}
                                >
                                    {t.hero.viewMenu}
                                </button>
                            </div>
                        </div>
                        <div
                            style={{
                                position: "relative",
                                minHeight: isMobile ? 360 : "100%",
                                overflow: "hidden",
                            }}
                        >
                            <img
                                src={heroNightImage}
                                alt={t.alts.heroSeafood}
                                loading="eager"
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    objectPosition: "30% 80%",
                                    transform: "scale(1.65)",
                                    transformOrigin: "25% 85%",
                                }}
                            />
                            <div
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    background:
                                        "linear-gradient(90deg, rgba(25,28,25,0.74) 0%, rgba(25,28,25,0.36) 28%, rgba(25,28,25,0.08) 45%, rgba(25,28,25,0) 58%)",
                                }}
                            />
                        </div>
                    </section>
                </>
            )}

            <section
                aria-label={t.quick.title}
                style={{
                    background: accentColor,
                    color: textColor,
                    padding: isPhone ? "24px 20px" : "28px " + heroPad + "px",
                }}
            >
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            containerWidth >= 1100
                                ? "minmax(240px,0.85fr) minmax(0,2.3fr)"
                                : "1fr",
                        gap: containerWidth >= 1100 ? 28 : 20,
                        alignItems: "center",
                    }}
                >
                    <div>
                        <h2
                            style={{
                                margin: 0,
                                fontFamily: uiFont,
                                fontWeight: 800,
                                fontSize: isPhone ? 28 : 30,
                                lineHeight: 1.3,
                                letterSpacing: "-0.035em",
                                color: "#fffaf2",
                                whiteSpace: "pre-line",
                            }}
                        >
                            {t.quick.title}
                        </h2>
                        <p
                            style={{
                                margin: "8px 0 0",
                                fontSize: 16,
                                fontWeight: 600,
                                lineHeight: 1.5,
                            }}
                        >
                            {t.quick.subtitle}
                        </p>
                    </div>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: isPhone
                                ? "minmax(0,1fr) minmax(0,1fr)"
                                : "minmax(0,1.1fr) minmax(0,1fr) minmax(0,0.7fr) minmax(0,1.1fr)",
                            gap: 12,
                            alignItems: "stretch",
                        }}
                    >
                        {(["date", "time", "guests"] as const).map((field) => (
                            <div
                                key={field}
                                style={{
                                    minWidth: 0,
                                    background: "rgba(255,250,242,0.78)",
                                    border: "1px solid rgba(255,255,255,0.7)",
                                    borderRadius: 8,
                                    padding: "10px 12px",
                                }}
                            >
                                <label
                                    htmlFor={"kd-quick-" + field}
                                    style={{
                                        ...labelStyle,
                                        marginBottom: 6,
                                        color: "#191C19",
                                    }}
                                >
                                    {t.quick[field]}
                                </label>
                                <input
                                    id={"kd-quick-" + field}
                                    type={field === "guests" ? "number" : field}
                                    min={
                                        field === "date"
                                            ? minHanoiDate
                                            : field === "guests"
                                              ? 1
                                              : undefined
                                    }
                                    value={
                                        field === "date"
                                            ? quickDate
                                            : field === "time"
                                              ? quickTime
                                              : quickGuests
                                    }
                                    onInput={(e) => {
                                        const value = e.currentTarget.value
                                        field === "date"
                                            ? setQuickDate(value)
                                            : field === "time"
                                              ? setQuickTime(value)
                                              : setQuickGuests(value)
                                    }}
                                    style={{
                                        width: "100%",
                                        minWidth: 0,
                                        minHeight: 36,
                                        border: 0,
                                        borderRadius: 4,
                                        background: "#FFF9F0",
                                        color: "#191C19",
                                        padding: isPhone
                                            ? "6px 4px"
                                            : "6px 8px",
                                        fontFamily: uiFont,
                                        fontSize: isPhone ? 16 : 17,
                                        fontWeight: 600,
                                        lineHeight: 1.4,
                                    }}
                                />
                            </div>
                        ))}
                        <button
                            onClick={(e) =>
                                openReservationWithQuick(e.currentTarget)
                            }
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 12,
                                minWidth: 0,
                                minHeight: 64,
                                padding: "16px 12px",
                                border: 0,
                                borderRadius: 8,
                                background: "#191C19",
                                color: "#F2F0E6",
                                ...ctaTextStyle,
                                cursor: "pointer",
                            }}
                        >
                            <span>{t.quick.button}</span>
                            <span aria-hidden="true" style={{ fontSize: 24 }}>
                                →
                            </span>
                        </button>
                    </div>
                </div>
            </section>
            <section
                aria-labelledby="kd-menu-heading"
                style={{
                    background: backgroundColor,
                    padding: isPhone
                        ? "28px 20px 24px"
                        : "28px " + heroPad + "px 24px",
                }}
            >
                <div style={{ marginBottom: 20 }}>
                    <p
                        style={{
                            margin: "0 0 8px",
                            fontSize: 14,
                            fontWeight: 800,
                            letterSpacing: "0.08em",
                            color: accentColor,
                        }}
                    >
                        MENU
                    </p>
                    <h2
                        id="kd-menu-heading"
                        style={{
                            margin: 0,
                            fontFamily: uiFont,
                            fontWeight: 800,
                            fontSize: isPhone ? 28 : 38,
                            lineHeight: 1.3,
                            letterSpacing: "-0.035em",
                            textWrap: "balance",
                        }}
                    >
                        {t.editorial.heading}
                    </h2>
                    <p style={{ margin: "8px 0 0", ...bodyTextStyle }}>
                        {t.editorial.intro}
                    </p>
                </div>
                {isPhone && (
                    <div
                        role="tablist"
                        aria-label={t.aria.experienceTabs}
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 8,
                            marginBottom: 16,
                        }}
                    >
                        {(["day", "night"] as ExperienceTab[]).map(
                            (tab, index) => (
                                <button
                                    key={tab}
                                    id={"kd-experience-" + tab}
                                    role="tab"
                                    ref={(el) => {
                                        experienceTabRefs.current[index] = el
                                    }}
                                    aria-selected={experienceTab === tab}
                                    aria-controls={"kd-experience-panel-" + tab}
                                    tabIndex={experienceTab === tab ? 0 : -1}
                                    onClick={() => setExperienceTab(tab)}
                                    onKeyDown={(e) => {
                                        if (
                                            [
                                                "ArrowLeft",
                                                "ArrowRight",
                                                "Home",
                                                "End",
                                            ].includes(e.key)
                                        ) {
                                            e.preventDefault()
                                            const next =
                                                e.key === "Home"
                                                    ? 0
                                                    : e.key === "End"
                                                      ? 1
                                                      : 1 - index
                                            setExperienceTab(
                                                next === 0 ? "day" : "night"
                                            )
                                            experienceTabRefs.current[
                                                next
                                            ]?.focus()
                                        }
                                    }}
                                    style={{
                                        minHeight: 48,
                                        border: "1px solid " + textColor,
                                        borderRadius: 6,
                                        background:
                                            experienceTab === tab
                                                ? textColor
                                                : "transparent",
                                        color:
                                            experienceTab === tab
                                                ? backgroundColor
                                                : textColor,
                                        ...ctaTextStyle,
                                    }}
                                >
                                    {tab === "day"
                                        ? t.mobileExperience.day
                                        : t.mobileExperience.night}
                                </button>
                            )
                        )}
                    </div>
                )}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: isPhone
                            ? "minmax(0,1fr)"
                            : "minmax(0,1fr) minmax(0,1fr)",
                        gap: 28,
                        alignItems: "stretch",
                    }}
                >
                    {(["day", "night"] as ExperienceTab[])
                        .filter((kind) => !isPhone || kind === experienceTab)
                        .map((kind) => (
                            <article
                                key={kind}
                                id={"kd-experience-panel-" + kind}
                                role={isPhone ? "tabpanel" : undefined}
                                aria-labelledby={
                                    isPhone
                                        ? "kd-experience-" + kind
                                        : undefined
                                }
                                style={{
                                    minWidth: 0,
                                    display: "flex",
                                    flexDirection: "column",
                                    border: "1px solid rgba(25,28,25,0.18)",
                                    borderRadius: 8,
                                    overflow: "hidden",
                                    background: "rgba(255,255,255,0.24)",
                                }}
                            >
                                <img
                                    src={
                                        kind === "day"
                                            ? coffeeImage
                                            : heroNightImage
                                    }
                                    alt={
                                        kind === "day"
                                            ? t.alts.coffee
                                            : t.alts.heroSeafood
                                    }
                                    loading="lazy"
                                    style={{
                                        display: "block",
                                        width: "100%",
                                        aspectRatio: isPhone ? "1.65" : "2.15",
                                        objectFit: "cover",
                                        objectPosition:
                                            kind === "day"
                                                ? "center 58%"
                                                : "center 64%",
                                    }}
                                />
                                <div
                                    style={{
                                        padding: isPhone ? 20 : 24,
                                        display: "flex",
                                        flexDirection: "column",
                                        flex: 1,
                                    }}
                                >
                                    <p
                                        style={{
                                            margin: "0 0 10px",
                                            color: accentColor,
                                            fontSize: 14,
                                            fontWeight: 800,
                                            letterSpacing: "0.04em",
                                        }}
                                    >
                                        {kind === "day"
                                            ? "DAY · CAFÉ"
                                            : "NIGHT · SEAFOOD"}
                                    </p>
                                    <h3
                                        style={{
                                            margin: 0,
                                            fontFamily: uiFont,
                                            fontSize: isPhone ? 28 : 32,
                                            fontWeight: 800,
                                            lineHeight: 1.3,
                                            letterSpacing: "-0.035em",
                                        }}
                                    >
                                        {kind === "day"
                                            ? t.editorial.dayTitle
                                            : t.editorial.nightTitle}
                                    </h3>
                                    <p
                                        style={{
                                            margin: "8px 0 18px",
                                            ...bodyTextStyle,
                                        }}
                                    >
                                        {kind === "day"
                                            ? t.editorial.dayDesc
                                            : t.editorial.nightDesc}
                                    </p>
                                    <button
                                        onClick={(e) => {
                                            setMenuTab(
                                                kind === "day"
                                                    ? "cafe"
                                                    : "seafood"
                                            )
                                            openDialog(
                                                setMenuOpen,
                                                e.currentTarget
                                            )
                                        }}
                                        style={{
                                            marginTop: "auto",
                                            width: "100%",
                                            minHeight: 52,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: 12,
                                            border: "1.5px solid " + textColor,
                                            borderRadius: 7,
                                            background: "transparent",
                                            color: textColor,
                                            padding: "12px 18px",
                                            ...ctaTextStyle,
                                            cursor: "pointer",
                                        }}
                                    >
                                        <span style={{ flex: 1 }}>
                                            {kind === "day"
                                                ? t.editorial.dayLink
                                                : t.editorial.nightLink}
                                        </span>
                                        <span
                                            aria-hidden="true"
                                            style={{ fontSize: 24 }}
                                        >
                                            →
                                        </span>
                                    </button>
                                </div>
                            </article>
                        ))}
                </div>
            </section>

            <section
                id="location"
                style={{
                    background: backgroundColor,
                    padding: isPhone
                        ? "0 20px 28px"
                        : "0 " + heroPad + "px 28px",
                }}
            >
                <div
                    style={{
                        borderTop: "1px solid " + textColor,
                        paddingTop: 20,
                        display: "grid",
                        gridTemplateColumns: isPhone
                            ? "minmax(0,1fr)"
                            : "minmax(0,1fr) minmax(0,1.1fr) minmax(0,1fr)",
                        gap: isPhone ? 20 : 32,
                        alignItems: "center",
                    }}
                >
                    <h3
                        style={{
                            margin: 0,
                            fontFamily: uiFont,
                            fontSize: isPhone ? 28 : 32,
                            fontWeight: 800,
                            lineHeight: 1.35,
                            letterSpacing: "-0.035em",
                            textWrap: "balance",
                        }}
                    >
                        {t.location.title}
                    </h3>
                    <img
                        src={facadeImage}
                        alt={t.alts.facade}
                        loading="lazy"
                        style={{
                            width: "100%",
                            height: isPhone ? 210 : 190,
                            objectFit: "cover",
                            borderRadius: 6,
                        }}
                    />
                    <div
                        style={{
                            minWidth: 0,
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                            fontSize: 16,
                            fontWeight: 500,
                            lineHeight: 1.55,
                        }}
                    >
                        <div>
                            <strong style={{ fontSize: 14, fontWeight: 800 }}>
                                {t.location.addressLabel}
                            </strong>
                            <br />
                            {address}
                        </div>
                        <div>
                            <strong style={{ fontSize: 14, fontWeight: 800 }}>
                                {t.location.contactLabel}
                            </strong>
                            <br />
                            <a
                                href={"tel:" + phoneLink}
                                style={{ color: textColor, fontWeight: 700 }}
                            >
                                {phoneDisplay}
                            </a>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                gap: 8,
                                flexWrap: "wrap",
                            }}
                        >
                            {[
                                { href: mapsHref, label: t.location.map },
                                { href: zaloUrl, label: t.location.zalo },
                            ].map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        display: "flex",
                                        flex: "1 1 110px",
                                        minHeight: 48,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        border: "1px solid " + textColor,
                                        borderRadius: 6,
                                        color: textColor,
                                        textDecoration: "none",
                                        padding: "10px 12px",
                                        fontSize: 15,
                                        fontWeight: 800,
                                        lineHeight: 1.3,
                                        textAlign: "center",
                                    }}
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section
                style={{
                    background: textColor,
                    color: backgroundColor,
                    padding: isPhone ? "32px 20px" : "40px " + heroPad + "px",
                }}
            >
                <div
                    style={{
                        ...maxWrap,
                        minHeight: isMobile ? undefined : 180,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                    }}
                >
                    <h3
                        style={{
                            margin: 0,
                            fontFamily: uiFont,
                            fontWeight: 800,
                            letterSpacing: "-0.035em",
                            fontSize: isPhone ? 30 : 42,
                            lineHeight: 1.05,
                        }}
                    >
                        {t.franchise.title}
                    </h3>
                    <p
                        style={{
                            marginTop: 16,
                            maxWidth: 760,
                            ...bodyTextStyle,
                        }}
                    >
                        {t.franchise.body}
                    </p>
                    <button
                        onClick={(e) =>
                            openDialog(setFranchiseOpen, e.currentTarget)
                        }
                        style={{
                            alignSelf: "flex-start",
                            width: "fit-content",
                            minHeight: 44,
                            marginTop: 12,
                            background: accentColor,
                            border: "none",
                            borderRadius: 8,
                            color: "#191C19",
                            padding: "14px 24px",
                            ...ctaTextStyle,
                        }}
                    >
                        {t.franchise.cta}
                    </button>
                </div>
            </section>

            <footer
                style={{
                    background: "#191C19",
                    color: "#F2F0E6",
                    borderTop: `1px solid ${accentColor}`,
                    padding: isMobile
                        ? `20px 12px ${isPhone ? 126 : 90}px`
                        : "24px 24px 90px",
                }}
            >
                <div
                    style={{
                        ...maxWrap,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 18,
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontFamily: uiFont,
                                fontWeight: 800,
                                letterSpacing: "-0.035em",
                                fontSize: 62,
                                lineHeight: 0.9,
                            }}
                        >
                            K-DRAMA
                        </div>
                        <a
                            href={companyUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                color: "#F2F0E6",
                                fontSize: 12,
                                letterSpacing: "0.12em",
                            }}
                        >
                            {t.footer.brand}
                        </a>
                    </div>
                    <nav
                        style={{
                            display: "flex",
                            gap: 12,
                            fontSize: 15,
                            fontWeight: 700,
                            lineHeight: 1.4,
                        }}
                    >
                        <button
                            onClick={(e) =>
                                openDialog(setMenuOpen, e.currentTarget)
                            }
                            style={{
                                border: "none",
                                background: "none",
                                color: "#F2F0E6",
                                padding: 0,
                                fontSize: 15,
                                fontWeight: 700,
                                lineHeight: 1.4,
                            }}
                        >
                            {t.nav.menu}
                        </button>
                        <a
                            href="#location"
                            style={{
                                color: "#F2F0E6",
                                fontSize: 15,
                                fontWeight: 700,
                                lineHeight: 1.4,
                            }}
                        >
                            {t.nav.location}
                        </a>
                        <button
                            onClick={(e) =>
                                openDialog(setFranchiseOpen, e.currentTarget)
                            }
                            style={{
                                border: "none",
                                background: "none",
                                color: "#F2F0E6",
                                padding: 0,
                                fontSize: 15,
                                fontWeight: 700,
                                lineHeight: 1.4,
                            }}
                        >
                            {t.nav.franchise}
                        </button>
                    </nav>
                </div>
            </footer>

            {modalRoot &&
                langSheetOpen &&
                createPortal(
                    modal(
                        t.fields.languageSwitch,
                        () => closeDialog(setLangSheetOpen),
                        langDialogRef,
                        <div
                            role="listbox"
                            aria-label={t.fields.languageSwitch}
                            style={{ display: "grid", gap: 8 }}
                        >
                            {(["ko", "zh", "en", "vi"] as Lang[]).map((l) => (
                                <button
                                    key={`lang-sheet-${l}`}
                                    role="option"
                                    aria-selected={l === lang}
                                    onClick={() =>
                                        startTransition(() => {
                                            selectLanguage(l)
                                            setLangSheetOpen(false)
                                        })
                                    }
                                    style={{
                                        minHeight: 48,
                                        border: `1px solid ${textColor}`,
                                        background:
                                            l === lang
                                                ? textColor
                                                : "transparent",
                                        color:
                                            l === lang
                                                ? backgroundColor
                                                : textColor,
                                        fontSize: 17,
                                        lineHeight: 1.4,
                                        fontWeight: 700,
                                    }}
                                >
                                    {defaultDict[l].langLabel}
                                </button>
                            ))}
                        </div>
                    ),
                    modalRoot
                )}

            {modalRoot &&
                isPhone &&
                canUseFixed &&
                !reservationOpen &&
                createPortal(
                    <nav
                        lang={lang}
                        aria-label={t.aria.phoneDock}
                        style={{
                            position: canUseFixed ? "fixed" : "absolute",
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 950,
                            background: "#191C19",
                            fontFamily: uiFont,
                            borderTop: `1px solid ${accentColor}`,
                            padding:
                                "8px 10px calc(8px + env(safe-area-inset-bottom))",
                            display: "grid",
                            gridTemplateColumns: "1fr 1.25fr 1fr",
                            gap: 8,
                        }}
                    >
                        <button
                            onClick={(e) =>
                                openDialog(setMenuOpen, e.currentTarget)
                            }
                            style={{
                                minHeight: 48,
                                border: `1px solid #F2F0E6`,
                                background: "transparent",
                                color: "#F2F0E6",
                                fontSize: 16,
                                lineHeight: 1.2,
                                fontWeight: 700,
                            }}
                        >
                            {t.phoneDock.menu}
                        </button>
                        <button
                            onClick={(e) =>
                                openReservationWithQuick(e.currentTarget)
                            }
                            style={{
                                minHeight: 56,
                                border: "none",
                                background: accentColor,
                                color: "#191C19",
                                fontSize: 18,
                                lineHeight: 1.2,
                                fontWeight: 800,
                            }}
                        >
                            {t.phoneDock.reserve}
                        </button>
                        <a
                            href={zaloUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                minHeight: 48,
                                border: `1px solid #F2F0E6`,
                                color: "#F2F0E6",
                                textDecoration: "none",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                                fontSize: 16,
                                fontWeight: 700,
                            }}
                        >
                            <span aria-hidden="true">💬</span>
                            {t.phoneDock.zalo}
                        </a>
                    </nav>,
                    modalRoot
                )}

            {modalRoot &&
                !isStatic &&
                !isPhone &&
                createPortal(
                    <a
                        href={zaloUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            position: "fixed",
                            right: 16,
                            bottom: 16,
                            zIndex: 1000,
                            background: accentColor,
                            color: "#191C19",
                            textDecoration: "none",
                            minHeight: 44,
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "0 16px",
                            fontWeight: 700,
                        }}
                    >
                        {t.footer.zaloBubble}
                    </a>,
                    modalRoot
                )}

            {menuOpen &&
                (isPhone ? (
                    canUseFixed && modalRoot ? (
                        createPortal(
                            <div
                                lang={lang}
                                role="presentation"
                                onMouseDown={(e) =>
                                    e.target === e.currentTarget &&
                                    closeDialog(setMenuOpen)
                                }
                                style={{
                                    position: "fixed",
                                    inset: 0,
                                    zIndex: 1250,
                                    background: "rgba(0,0,0,0.56)",
                                }}
                            >
                                <div
                                    ref={menuDialogRef}
                                    className="kd-dialog"
                                    role="dialog"
                                    aria-modal="true"
                                    aria-label={t.menuDialog.title}
                                    style={{
                                        height: "100dvh",
                                        background: backgroundColor,
                                        color: textColor,
                                        display: "flex",
                                        flexDirection: "column",
                                        fontFamily: uiFont,
                                        fontSize: 16,
                                        lineHeight: 1.6,
                                    }}
                                >
                                    <div
                                        style={{
                                            position: "sticky",
                                            top: 0,
                                            background: backgroundColor,
                                            borderBottom: `1px solid ${textColor}`,
                                            padding: "10px 12px",
                                            zIndex: 2,
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                            }}
                                        >
                                            <h3
                                                style={{
                                                    margin: 0,
                                                    fontSize: 24,
                                                    lineHeight: 1.2,
                                                    fontWeight: 800,
                                                }}
                                            >
                                                {t.menuDialog.title}
                                            </h3>
                                            <button
                                                onClick={() =>
                                                    closeDialog(setMenuOpen)
                                                }
                                                style={{
                                                    minHeight: 48,
                                                    minWidth: 48,
                                                    border: "none",
                                                    background: "transparent",
                                                    color: textColor,
                                                    fontSize: 16,
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {t.fields.close}
                                            </button>
                                        </div>
                                        <div
                                            role="tablist"
                                            aria-label={t.menuDialog.title}
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns: "1fr 1fr",
                                                gap: 8,
                                                marginTop: 8,
                                            }}
                                        >
                                            {(
                                                ["cafe", "seafood"] as MenuTab[]
                                            ).map((tab, i) => (
                                                <button
                                                    key={`phone-${tab}`}
                                                    id={`menu-tab-${tab}`}
                                                    role="tab"
                                                    aria-controls={`menu-panel-${tab}`}
                                                    aria-selected={
                                                        menuTab === tab
                                                    }
                                                    tabIndex={
                                                        menuTab === tab ? 0 : -1
                                                    }
                                                    ref={(el) => {
                                                        menuTabRefs.current[i] =
                                                            el
                                                    }}
                                                    onClick={() =>
                                                        startTransition(() =>
                                                            setMenuTab(tab)
                                                        )
                                                    }
                                                    onKeyDown={(e) => {
                                                        if (
                                                            e.key ===
                                                                "ArrowRight" ||
                                                            e.key ===
                                                                "ArrowLeft" ||
                                                            e.key === "Home" ||
                                                            e.key === "End"
                                                        ) {
                                                            const n =
                                                                e.key === "Home"
                                                                    ? 0
                                                                    : e.key ===
                                                                        "End"
                                                                      ? 1
                                                                      : i === 0
                                                                        ? 1
                                                                        : 0
                                                            const nt =
                                                                n === 0
                                                                    ? "cafe"
                                                                    : "seafood"
                                                            startTransition(
                                                                () =>
                                                                    setMenuTab(
                                                                        nt
                                                                    )
                                                            )
                                                            menuTabRefs.current[
                                                                n
                                                            ]?.focus()
                                                        }
                                                    }}
                                                    style={{
                                                        minHeight: 48,
                                                        border: `1px solid ${textColor}`,
                                                        background:
                                                            menuTab === tab
                                                                ? textColor
                                                                : "transparent",
                                                        color:
                                                            menuTab === tab
                                                                ? backgroundColor
                                                                : textColor,
                                                        fontSize: 16,
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {tab === "cafe"
                                                        ? t.menuDialog.tabs.cafe
                                                        : t.menuDialog.tabs
                                                              .seafood}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            flex: 1,
                                            minHeight: 0,
                                            overflow: "auto",
                                            padding: "12px 12px 96px",
                                        }}
                                    >
                                        {menuTab === "cafe" ? (
                                            <div
                                                id="menu-panel-cafe"
                                                role="tabpanel"
                                                aria-labelledby="menu-tab-cafe"
                                            >
                                                <img
                                                    src={coffeeImage}
                                                    alt={t.alts.coffee}
                                                    loading="lazy"
                                                    style={{
                                                        width: "100%",
                                                        height: 200,
                                                        objectFit: "cover",
                                                        marginBottom: 10,
                                                    }}
                                                />
                                                {t.menuItems.cafe.map(
                                                    (
                                                        item: any,
                                                        idx: number
                                                    ) => (
                                                        <div
                                                            key={`cafe-row-${idx}`}
                                                            style={{
                                                                display: "flex",
                                                                justifyContent:
                                                                    "space-between",
                                                                alignItems:
                                                                    "baseline",
                                                                borderBottom: `1px solid ${textColor}22`,
                                                                padding:
                                                                    "10px 0",
                                                                gap: 12,
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    fontSize: 16,
                                                                    lineHeight: 1.6,
                                                                }}
                                                            >
                                                                {item.name}
                                                            </div>
                                                            <div
                                                                style={{
                                                                    fontSize: 16,
                                                                    lineHeight: 1.6,
                                                                    fontWeight: 700,
                                                                }}
                                                            >
                                                                {item.price}
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                                <img
                                                    src={waffleImage}
                                                    alt={t.alts.waffle}
                                                    loading="lazy"
                                                    style={{
                                                        width: "100%",
                                                        height: 180,
                                                        objectFit: "cover",
                                                        marginTop: 14,
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                id="menu-panel-seafood"
                                                role="tabpanel"
                                                aria-labelledby="menu-tab-seafood"
                                            >
                                                <div
                                                    style={{
                                                        overflow: "hidden",
                                                        height: 190,
                                                        marginBottom: 10,
                                                    }}
                                                >
                                                    <img
                                                        src={heroNightImage}
                                                        alt={t.alts.heroSeafood}
                                                        loading="lazy"
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                            objectFit: "cover",
                                                            objectPosition:
                                                                "30% 80%",
                                                            transform:
                                                                "scale(1.65)",
                                                            transformOrigin:
                                                                "25% 85%",
                                                        }}
                                                    />
                                                </div>
                                                <img
                                                    src={seafoodImage}
                                                    alt={t.alts.seafoodDetail}
                                                    loading="lazy"
                                                    style={{
                                                        width: "100%",
                                                        height: 190,
                                                        objectFit: "cover",
                                                        objectPosition:
                                                            "50% 65%",
                                                    }}
                                                />
                                                <p
                                                    style={{
                                                        margin: "12px 0 10px",
                                                        ...bodyTextStyle,
                                                    }}
                                                >
                                                    {t.menuItems.askPrice}
                                                </p>
                                                <a
                                                    href={zaloUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    style={{
                                                        color: accentColor,
                                                        textDecoration:
                                                            "underline",
                                                        fontSize: 16,
                                                        lineHeight: 1.6,
                                                    }}
                                                >
                                                    {t.menuItems.inquiry}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        style={{
                                            position: "sticky",
                                            bottom: 0,
                                            borderTop: `1px solid ${textColor}`,
                                            background: backgroundColor,
                                            padding:
                                                "10px 12px calc(10px + env(safe-area-inset-bottom))",
                                        }}
                                    >
                                        <button
                                            onClick={(e) =>
                                                openReservationWithQuick(
                                                    e.currentTarget
                                                )
                                            }
                                            style={{
                                                width: "100%",
                                                minHeight: 48,
                                                border: "none",
                                                background: accentColor,
                                                color: "#191C19",
                                                fontSize: 16,
                                                fontWeight: 700,
                                                ...ctaTextStyle,
                                            }}
                                        >
                                            {t.reserve}
                                        </button>
                                    </div>
                                </div>
                            </div>,
                            modalRoot
                        )
                    ) : (
                        <div
                            lang={lang}
                            role="presentation"
                            onMouseDown={(e) =>
                                e.target === e.currentTarget &&
                                closeDialog(setMenuOpen)
                            }
                            style={{
                                position: "absolute",
                                inset: 0,
                                zIndex: 1250,
                                background: "rgba(0,0,0,0.56)",
                            }}
                        >
                            <div
                                ref={menuDialogRef}
                                className="kd-dialog"
                                role="dialog"
                                aria-modal="true"
                                aria-label={t.menuDialog.title}
                                style={{
                                    height: "100%",
                                    background: backgroundColor,
                                    color: textColor,
                                    display: "flex",
                                    flexDirection: "column",
                                    fontFamily: uiFont,
                                    fontSize: 16,
                                    lineHeight: 1.6,
                                }}
                            >
                                <div
                                    style={{
                                        position: "sticky",
                                        top: 0,
                                        background: backgroundColor,
                                        borderBottom: `1px solid ${textColor}`,
                                        padding: "10px 12px",
                                        zIndex: 2,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <h3
                                            style={{
                                                margin: 0,
                                                fontSize: 24,
                                                lineHeight: 1.2,
                                                fontWeight: 800,
                                            }}
                                        >
                                            {t.menuDialog.title}
                                        </h3>
                                        <button
                                            onClick={() =>
                                                closeDialog(setMenuOpen)
                                            }
                                            style={{
                                                minHeight: 48,
                                                minWidth: 48,
                                                border: "none",
                                                background: "transparent",
                                                color: textColor,
                                                fontSize: 16,
                                                fontWeight: 700,
                                            }}
                                        >
                                            {t.fields.close}
                                        </button>
                                    </div>
                                    <div
                                        role="tablist"
                                        aria-label={t.menuDialog.title}
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "1fr 1fr",
                                            gap: 8,
                                            marginTop: 8,
                                        }}
                                    >
                                        {(["cafe", "seafood"] as MenuTab[]).map(
                                            (tab, i) => (
                                                <button
                                                    key={`phone-local-${tab}`}
                                                    id={`menu-tab-${tab}`}
                                                    role="tab"
                                                    aria-controls={`menu-panel-${tab}`}
                                                    aria-selected={
                                                        menuTab === tab
                                                    }
                                                    tabIndex={
                                                        menuTab === tab ? 0 : -1
                                                    }
                                                    ref={(el) => {
                                                        menuTabRefs.current[i] =
                                                            el
                                                    }}
                                                    onClick={() =>
                                                        startTransition(() =>
                                                            setMenuTab(tab)
                                                        )
                                                    }
                                                    onKeyDown={(e) => {
                                                        if (
                                                            e.key ===
                                                                "ArrowRight" ||
                                                            e.key ===
                                                                "ArrowLeft" ||
                                                            e.key === "Home" ||
                                                            e.key === "End"
                                                        ) {
                                                            const n =
                                                                e.key === "Home"
                                                                    ? 0
                                                                    : e.key ===
                                                                        "End"
                                                                      ? 1
                                                                      : i === 0
                                                                        ? 1
                                                                        : 0
                                                            const nt =
                                                                n === 0
                                                                    ? "cafe"
                                                                    : "seafood"
                                                            startTransition(
                                                                () =>
                                                                    setMenuTab(
                                                                        nt
                                                                    )
                                                            )
                                                            menuTabRefs.current[
                                                                n
                                                            ]?.focus()
                                                        }
                                                    }}
                                                    style={{
                                                        minHeight: 48,
                                                        border: `1px solid ${textColor}`,
                                                        background:
                                                            menuTab === tab
                                                                ? textColor
                                                                : "transparent",
                                                        color:
                                                            menuTab === tab
                                                                ? backgroundColor
                                                                : textColor,
                                                        fontSize: 16,
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {tab === "cafe"
                                                        ? t.menuDialog.tabs.cafe
                                                        : t.menuDialog.tabs
                                                              .seafood}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                                <div
                                    style={{
                                        flex: 1,
                                        minHeight: 0,
                                        overflow: "auto",
                                        padding: "12px 12px 96px",
                                    }}
                                >
                                    {menuTab === "cafe" ? (
                                        <div
                                            id="menu-panel-cafe"
                                            role="tabpanel"
                                            aria-labelledby="menu-tab-cafe"
                                        >
                                            <img
                                                src={coffeeImage}
                                                alt={t.alts.coffee}
                                                loading="lazy"
                                                style={{
                                                    width: "100%",
                                                    height: 200,
                                                    objectFit: "cover",
                                                    marginBottom: 10,
                                                }}
                                            />
                                            {t.menuItems.cafe.map(
                                                (item: any, idx: number) => (
                                                    <div
                                                        key={`cafe-local-row-${idx}`}
                                                        style={{
                                                            display: "flex",
                                                            justifyContent:
                                                                "space-between",
                                                            alignItems:
                                                                "baseline",
                                                            borderBottom: `1px solid ${textColor}22`,
                                                            padding: "10px 0",
                                                            gap: 12,
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                fontSize: 16,
                                                                lineHeight: 1.6,
                                                            }}
                                                        >
                                                            {item.name}
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: 16,
                                                                lineHeight: 1.6,
                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            {item.price}
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                            <img
                                                src={waffleImage}
                                                alt={t.alts.waffle}
                                                loading="lazy"
                                                style={{
                                                    width: "100%",
                                                    height: 180,
                                                    objectFit: "cover",
                                                    marginTop: 14,
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            id="menu-panel-seafood"
                                            role="tabpanel"
                                            aria-labelledby="menu-tab-seafood"
                                        >
                                            <div
                                                style={{
                                                    overflow: "hidden",
                                                    height: 190,
                                                    marginBottom: 10,
                                                }}
                                            >
                                                <img
                                                    src={heroNightImage}
                                                    alt={t.alts.heroSeafood}
                                                    loading="lazy"
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover",
                                                        objectPosition:
                                                            "30% 80%",
                                                        transform:
                                                            "scale(1.65)",
                                                        transformOrigin:
                                                            "25% 85%",
                                                    }}
                                                />
                                            </div>
                                            <img
                                                src={seafoodImage}
                                                alt={t.alts.seafoodDetail}
                                                loading="lazy"
                                                style={{
                                                    width: "100%",
                                                    height: 190,
                                                    objectFit: "cover",
                                                    objectPosition: "50% 65%",
                                                }}
                                            />
                                            <p
                                                style={{
                                                    margin: "12px 0 10px",
                                                    ...bodyTextStyle,
                                                }}
                                            >
                                                {t.menuItems.askPrice}
                                            </p>
                                            <a
                                                href={zaloUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                style={{
                                                    color: accentColor,
                                                    textDecoration: "underline",
                                                    fontSize: 16,
                                                    lineHeight: 1.6,
                                                }}
                                            >
                                                {t.menuItems.inquiry}
                                            </a>
                                        </div>
                                    )}
                                </div>
                                <div
                                    style={{
                                        position: "sticky",
                                        bottom: 0,
                                        borderTop: `1px solid ${textColor}`,
                                        background: backgroundColor,
                                        padding:
                                            "10px 12px calc(10px + env(safe-area-inset-bottom))",
                                    }}
                                >
                                    <button
                                        onClick={(e) =>
                                            openReservationWithQuick(
                                                e.currentTarget
                                            )
                                        }
                                        style={{
                                            width: "100%",
                                            minHeight: 48,
                                            border: "none",
                                            background: accentColor,
                                            color: "#191C19",
                                            fontSize: 16,
                                            fontWeight: 700,
                                            ...ctaTextStyle,
                                        }}
                                    >
                                        {t.reserve}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                ) : (
                    modalRoot &&
                    createPortal(
                        modal(
                            t.menuDialog.title,
                            () => closeDialog(setMenuOpen),
                            menuDialogRef,
                            <div>
                                <div
                                    style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 8,
                                        marginBottom: 10,
                                    }}
                                >
                                    {(["ko", "zh", "en", "vi"] as Lang[]).map(
                                        (l) => (
                                            <button
                                                key={`dlg-menu-${l}`}
                                                aria-label={`${t.fields.languageSwitch} ${defaultDict[l].langLabel}`}
                                                aria-pressed={l === lang}
                                                onClick={() =>
                                                    startTransition(() =>
                                                        selectLanguage(l)
                                                    )
                                                }
                                                style={{
                                                    minHeight: 44,
                                                    border: `1px solid ${textColor}`,
                                                    background: "transparent",
                                                    color:
                                                        l === lang
                                                            ? accentColor
                                                            : textColor,
                                                    padding: "0 12px",
                                                    fontSize: 14,
                                                    lineHeight: 1.4,
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {defaultDict[l].langLabel}
                                            </button>
                                        )
                                    )}
                                </div>
                                <div
                                    role="tablist"
                                    aria-label={t.menuDialog.title}
                                    style={{
                                        display: "flex",
                                        borderBottom: `1px solid ${textColor}`,
                                        marginBottom: 14,
                                    }}
                                >
                                    {(["cafe", "seafood"] as MenuTab[]).map(
                                        (tab, i) => (
                                            <button
                                                key={tab}
                                                id={`menu-tab-${tab}`}
                                                role="tab"
                                                aria-controls={`menu-panel-${tab}`}
                                                aria-selected={menuTab === tab}
                                                tabIndex={
                                                    menuTab === tab ? 0 : -1
                                                }
                                                ref={(el) => {
                                                    menuTabRefs.current[i] = el
                                                }}
                                                onClick={() =>
                                                    startTransition(() =>
                                                        setMenuTab(tab)
                                                    )
                                                }
                                                onKeyDown={(e) => {
                                                    if (
                                                        e.key ===
                                                            "ArrowRight" ||
                                                        e.key === "ArrowLeft" ||
                                                        e.key === "Home" ||
                                                        e.key === "End"
                                                    ) {
                                                        const n =
                                                            e.key === "Home"
                                                                ? 0
                                                                : e.key ===
                                                                    "End"
                                                                  ? 1
                                                                  : i === 0
                                                                    ? 1
                                                                    : 0
                                                        const nt =
                                                            n === 0
                                                                ? "cafe"
                                                                : "seafood"
                                                        startTransition(() =>
                                                            setMenuTab(nt)
                                                        )
                                                        menuTabRefs.current[
                                                            n
                                                        ]?.focus()
                                                    }
                                                }}
                                                style={{
                                                    border: "none",
                                                    borderBottom:
                                                        menuTab === tab
                                                            ? `2px solid ${accentColor}`
                                                            : "2px solid transparent",
                                                    background: "none",
                                                    color: textColor,
                                                    padding: "10px 14px",
                                                    fontSize: 16,
                                                    lineHeight: 1.4,
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {tab === "cafe"
                                                    ? t.menuDialog.tabs.cafe
                                                    : t.menuDialog.tabs.seafood}
                                            </button>
                                        )
                                    )}
                                </div>
                                {menuTab === "cafe" ? (
                                    <div
                                        id="menu-panel-cafe"
                                        role="tabpanel"
                                        aria-labelledby="menu-tab-cafe"
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: isMobile
                                                ? "1fr"
                                                : "1fr 1fr",
                                            gap: 12,
                                        }}
                                    >
                                        <img
                                            src={coffeeImage}
                                            alt={t.alts.coffee}
                                            loading="lazy"
                                            style={{
                                                width: "100%",
                                                height: 220,
                                                objectFit: "cover",
                                            }}
                                        />
                                        <img
                                            src={waffleImage}
                                            alt={t.alts.waffle}
                                            loading="lazy"
                                            style={{
                                                width: "100%",
                                                height: 220,
                                                objectFit: "cover",
                                            }}
                                        />
                                        <p
                                            style={{
                                                gridColumn: "1/-1",
                                                margin: 0,
                                                ...bodyTextStyle,
                                                fontWeight: 500,
                                            }}
                                        >
                                            {t.menuDialog.cafeDesc}
                                        </p>
                                        <div style={{ gridColumn: "1/-1" }}>
                                            {t.menuItems.cafe.map((item: { name: string; price: string }, index: number) => (
                                                <div key={index} style={{ display: "flex", justifyContent: "space-between", gap: 20, padding: "14px 0", borderBottom: `1px solid ${textColor}22`, fontSize: 18, fontWeight: 700, lineHeight: 1.5 }}>
                                                    <span>{item.name}</span>
                                                    <span style={{ whiteSpace: "nowrap" }}>{item.price}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        id="menu-panel-seafood"
                                        role="tabpanel"
                                        aria-labelledby="menu-tab-seafood"
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: isMobile
                                                ? "1fr"
                                                : "1fr 1fr",
                                            gap: 12,
                                        }}
                                    >
                                        <div
                                            style={{
                                                overflow: "hidden",
                                                height: 220,
                                            }}
                                        >
                                            <img
                                                src={heroNightImage}
                                                alt={t.alts.heroSeafood}
                                                loading="lazy"
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                    objectPosition: "30% 80%",
                                                    transform: "scale(1.65)",
                                                    transformOrigin: "25% 85%",
                                                }}
                                            />
                                        </div>
                                        <img
                                            src={seafoodImage}
                                            alt={t.alts.seafoodDetail}
                                            loading="lazy"
                                            style={{
                                                width: "100%",
                                                height: 220,
                                                objectFit: "cover",
                                                objectPosition: "50% 65%",
                                            }}
                                        />
                                        <p
                                            style={{
                                                gridColumn: "1/-1",
                                                margin: 0,
                                                ...bodyTextStyle,
                                                fontWeight: 500,
                                            }}
                                        >
                                            {t.menuDialog.seafoodDesc}
                                        </p>
                                        <p style={{ gridColumn: "1/-1", margin: 0, ...bodyTextStyle }}>{t.menuItems.askPrice}</p>
                                        <a href={zaloUrl} target="_blank" rel="noreferrer" style={{ gridColumn: "1/-1", color: textColor, fontWeight: 800, fontSize: 17 }}>{t.menuItems.inquiry}</a>
                                    </div>
                                )}
                                <button type="button" onClick={(e) => openReservationWithQuick(e.currentTarget)} style={{ width: "100%", marginTop: 20, minHeight: 52, border: "none", background: accentColor, color: textColor, ...ctaTextStyle }}>{t.reserve}</button>
                            </div>
                        ),
                        modalRoot
                    )
                ))}

            {reservationOpen &&
                (isPhone ? (
                    canUseFixed && modalRoot ? (
                        createPortal(
                            <div
                                lang={lang}
                                role="presentation"
                                onMouseDown={(e) =>
                                    e.target === e.currentTarget &&
                                    closeDialog(setReservationOpen)
                                }
                                style={{
                                    position: "fixed",
                                    inset: 0,
                                    zIndex: 1300,
                                    background: "rgba(0,0,0,0.56)",
                                    display: "flex",
                                    alignItems: "flex-end",
                                }}
                            >
                                <AnimatePresence>
                                    <motion.div
                                        initial={
                                            reduceMotion ? false : { y: "100%" }
                                        }
                                        animate={{ y: 0 }}
                                        exit={reduceMotion ? {} : { y: "100%" }}
                                        transition={{ duration: 0.22 }}
                                        ref={reservationDialogRef}
                                        className="kd-dialog"
                                        role="dialog"
                                        aria-modal="true"
                                        aria-label={t.reservation.title}
                                        style={{
                                            width: "100%",
                                            maxHeight: "92dvh",
                                            background: backgroundColor,
                                            color: textColor,
                                            borderTopLeftRadius: 20,
                                            borderTopRightRadius: 20,
                                            overflow: "hidden",
                                            display: "flex",
                                            flexDirection: "column",
                                            fontFamily: uiFont,
                                        }}
                                    >
                                        <div
                                            style={{
                                                padding: "8px 16px 10px",
                                                borderBottom: `1px solid ${textColor}`,
                                                position: "sticky",
                                                top: 0,
                                                background: backgroundColor,
                                                zIndex: 2,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: 52,
                                                    height: 4,
                                                    borderRadius: 99,
                                                    margin: "0 auto 10px",
                                                    background: textColor,
                                                    opacity: 0.35,
                                                }}
                                            />
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: 24,
                                                        lineHeight: 1.2,
                                                        fontWeight: 800,
                                                    }}
                                                >
                                                    {t.reservation.title}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        closeDialog(
                                                            setReservationOpen
                                                        )
                                                    }
                                                    style={{
                                                        minHeight: 48,
                                                        border: "none",
                                                        background:
                                                            "transparent",
                                                        color: textColor,
                                                        fontSize: 16,
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {t.fields.close}
                                                </button>
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 14,
                                                    marginTop: 4,
                                                }}
                                            >
                                                {t.fields.step}{" "}
                                                {reservationStep}:{" "}
                                                {reservationStep === 1
                                                    ? t.stepNames.details
                                                    : t.stepNames.contact}
                                            </div>
                                        </div>
                                        <form
                                            noValidate
                                            onSubmit={reservationSubmit}
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                minHeight: 0,
                                                flex: 1,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    overflow: "auto",
                                                    padding: "14px 16px 18px",
                                                    minHeight: 0,
                                                    flex: 1,
                                                }}
                                            >
                                                {reservationStep === 1 ? (
                                                    <>
                                                        {(
                                                            [
                                                                "date",
                                                                "time",
                                                                "guests",
                                                            ] as Array<
                                                                | "date"
                                                                | "time"
                                                                | "guests"
                                                            >
                                                        ).map((f) => (
                                                            <div
                                                                key={f}
                                                                style={{
                                                                    marginBottom: 12,
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        ...labelStyle,
                                                                        fontSize: 16,
                                                                    }}
                                                                    htmlFor={`rp-${f}`}
                                                                >
                                                                    {
                                                                        (
                                                                            t.reservation as any
                                                                        )[f]
                                                                    }
                                                                </label>
                                                                <input
                                                                    id={`rp-${f}`}
                                                                    type={
                                                                        f ===
                                                                        "date"
                                                                            ? "date"
                                                                            : f ===
                                                                                "time"
                                                                              ? "time"
                                                                              : "number"
                                                                    }
                                                                    min={
                                                                        f ===
                                                                        "guests"
                                                                            ? 1
                                                                            : f ===
                                                                                "date"
                                                                              ? minHanoiDate
                                                                              : undefined
                                                                    }
                                                                    aria-invalid={Boolean(
                                                                        reservationErrors[
                                                                            f
                                                                        ]
                                                                    )}
                                                                    value={
                                                                        (
                                                                            reservationForm as any
                                                                        )[f]
                                                                    }
                                                                    onInput={(
                                                                        e
                                                                    ) => {
                                                                        const value =
                                                                            e
                                                                                .currentTarget
                                                                                .value
                                                                        setReservationForm(
                                                                            (
                                                                                p
                                                                            ) => ({
                                                                                ...p,
                                                                                [f]: value,
                                                                            })
                                                                        )
                                                                    }}
                                                                    style={{
                                                                        ...inputStyle,
                                                                        fontSize: 16,
                                                                    }}
                                                                />
                                                                {reservationErrors[
                                                                    f
                                                                ] && (
                                                                    <div
                                                                        style={{
                                                                            color: accentColor,
                                                                            fontSize: 12,
                                                                        }}
                                                                    >
                                                                        {errorText(
                                                                            reservationErrors[
                                                                                f
                                                                            ]
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </>
                                                ) : (
                                                    <>
                                                        {(
                                                            [
                                                                "name",
                                                                "contact",
                                                            ] as Array<
                                                                | "name"
                                                                | "contact"
                                                            >
                                                        ).map((f) => (
                                                            <div
                                                                key={f}
                                                                style={{
                                                                    marginBottom: 12,
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        ...labelStyle,
                                                                        fontSize: 16,
                                                                    }}
                                                                    htmlFor={`rp-${f}`}
                                                                >
                                                                    {
                                                                        (
                                                                            t.reservation as any
                                                                        )[f]
                                                                    }
                                                                </label>
                                                                <input
                                                                    id={`rp-${f}`}
                                                                    type="text"
                                                                    aria-invalid={Boolean(
                                                                        reservationErrors[
                                                                            f
                                                                        ]
                                                                    )}
                                                                    value={
                                                                        (
                                                                            reservationForm as any
                                                                        )[f]
                                                                    }
                                                                    onInput={(
                                                                        e
                                                                    ) => {
                                                                        const value =
                                                                            e
                                                                                .currentTarget
                                                                                .value
                                                                        setReservationForm(
                                                                            (
                                                                                p
                                                                            ) => ({
                                                                                ...p,
                                                                                [f]: value,
                                                                            })
                                                                        )
                                                                    }}
                                                                    style={{
                                                                        ...inputStyle,
                                                                        fontSize: 16,
                                                                    }}
                                                                />
                                                                {reservationErrors[
                                                                    f
                                                                ] && (
                                                                    <div
                                                                        style={{
                                                                            color: accentColor,
                                                                            fontSize: 12,
                                                                        }}
                                                                    >
                                                                        {errorText(
                                                                            reservationErrors[
                                                                                f
                                                                            ]
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                        <div
                                                            style={{
                                                                marginBottom: 12,
                                                            }}
                                                        >
                                                            <label
                                                                style={{
                                                                    ...labelStyle,
                                                                    fontSize: 16,
                                                                }}
                                                                htmlFor="rp-notes"
                                                            >
                                                                {
                                                                    t
                                                                        .reservation
                                                                        .notes
                                                                }
                                                            </label>
                                                            <textarea
                                                                id="rp-notes"
                                                                value={
                                                                    reservationForm.notes
                                                                }
                                                                onInput={(
                                                                    e
                                                                ) => {
                                                                    const value =
                                                                        e
                                                                            .currentTarget
                                                                            .value
                                                                    setReservationForm(
                                                                        (
                                                                            p
                                                                        ) => ({
                                                                            ...p,
                                                                            notes: value,
                                                                        })
                                                                    )
                                                                }}
                                                                style={{
                                                                    ...inputStyle,
                                                                    minHeight: 96,
                                                                    fontSize: 16,
                                                                }}
                                                            />
                                                        </div>
                                                        <p
                                                            style={{
                                                                ...bodyTextStyle,
                                                                fontSize: 16,
                                                                lineHeight: 1.6,
                                                                margin: 0,
                                                            }}
                                                        >
                                                            {t.reservation.note}
                                                        </p>
                                                        {reservationSubmitted && (
                                                            <div
                                                                style={{
                                                                    marginTop: 14,
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        ...labelStyle,
                                                                        fontSize: 20,
                                                                        fontWeight: 700,
                                                                    }}
                                                                >
                                                                    {
                                                                        t
                                                                            .reservation
                                                                            .summaryTitle
                                                                    }
                                                                </div>
                                                                <pre
                                                                    style={{
                                                                        whiteSpace:
                                                                            "pre-wrap",
                                                                        userSelect:
                                                                            "text",
                                                                        border: `1px solid ${textColor}`,
                                                                        padding: 12,
                                                                        margin: 0,
                                                                        fontFamily:
                                                                            uiFont,
                                                                        fontSize: 16,
                                                                        lineHeight: 1.6,
                                                                    }}
                                                                >
                                                                    {
                                                                        reservationSummary
                                                                    }
                                                                </pre>
                                                                <p
                                                                    role="status"
                                                                    aria-live="polite"
                                                                    style={{
                                                                        ...bodyTextStyle,
                                                                        marginTop: 8,
                                                                    }}
                                                                >
                                                                    {reservationCopyStatus ===
                                                                    "ok"
                                                                        ? t
                                                                              .reservation
                                                                              .statusOk
                                                                        : reservationCopyStatus ===
                                                                            "fail"
                                                                          ? t
                                                                                .reservation
                                                                                .statusFail
                                                                          : ""}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                            <div
                                                style={{
                                                    borderTop: `1px solid ${textColor}`,
                                                    padding:
                                                        "10px 16px calc(10px + env(safe-area-inset-bottom))",
                                                    display: "flex",
                                                    gap: 8,
                                                    position: "sticky",
                                                    bottom: 0,
                                                    background: backgroundColor,
                                                }}
                                            >
                                                {reservationStep === 1 ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            startTransition(
                                                                () =>
                                                                    setReservationErrors(
                                                                        {}
                                                                    )
                                                            )
                                                            if (
                                                                validateReservationStep1()
                                                            )
                                                                startTransition(
                                                                    () =>
                                                                        setReservationStep(
                                                                            2
                                                                        )
                                                                )
                                                        }}
                                                        style={{
                                                            minHeight: 48,
                                                            width: "100%",
                                                            border: "none",
                                                            background:
                                                                accentColor,
                                                            color: "#191C19",
                                                            ...ctaTextStyle,
                                                            fontSize: 16,
                                                            lineHeight: 1.2,
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        {t.fields.next}
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                startTransition(
                                                                    () =>
                                                                        setReservationStep(
                                                                            1
                                                                        )
                                                                )
                                                            }
                                                            style={{
                                                                minHeight: 48,
                                                                flex: 1,
                                                                border: `1px solid ${textColor}`,
                                                                background:
                                                                    "transparent",
                                                                color: textColor,
                                                                ...ctaTextStyle,
                                                                fontSize: 16,
                                                                lineHeight: 1.2,
                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            {t.fields.back}
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            style={{
                                                                minHeight: 48,
                                                                flex: 1.5,
                                                                border: "none",
                                                                background:
                                                                    accentColor,
                                                                color: "#191C19",
                                                                ...ctaTextStyle,
                                                                fontSize: 16,
                                                                lineHeight: 1.2,
                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            {
                                                                t.reservation
                                                                    .submit
                                                            }
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </form>
                                    </motion.div>
                                </AnimatePresence>
                            </div>,
                            modalRoot
                        )
                    ) : (
                        <div
                            lang={lang}
                            role="presentation"
                            onMouseDown={(e) =>
                                e.target === e.currentTarget &&
                                closeDialog(setReservationOpen)
                            }
                            style={{
                                position: "absolute",
                                inset: 0,
                                zIndex: 1300,
                                background: "rgba(0,0,0,0.56)",
                                display: "flex",
                                alignItems: "flex-end",
                            }}
                        />
                    )
                ) : (
                    modalRoot &&
                    createPortal(
                        modal(
                            t.reservation.title,
                            () => closeDialog(setReservationOpen),
                            reservationDialogRef,
                            <form noValidate onSubmit={reservationSubmit}>
                                <div
                                    style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 8,
                                        marginBottom: 10,
                                    }}
                                >
                                    {(["ko", "zh", "en", "vi"] as Lang[]).map(
                                        (l) => (
                                            <button
                                                key={`dlg-res-${l}`}
                                                type="button"
                                                aria-label={`${t.fields.languageSwitch} ${defaultDict[l].langLabel}`}
                                                aria-pressed={l === lang}
                                                onClick={() =>
                                                    startTransition(() =>
                                                        selectLanguage(l)
                                                    )
                                                }
                                                style={{
                                                    minHeight: 44,
                                                    border: `1px solid ${textColor}`,
                                                    background: "transparent",
                                                    color:
                                                        l === lang
                                                            ? accentColor
                                                            : textColor,
                                                    padding: "0 12px",
                                                    fontSize: 14,
                                                    lineHeight: 1.4,
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {defaultDict[l].langLabel}
                                            </button>
                                        )
                                    )}
                                </div>
                                <p
                                    style={{
                                        marginTop: 0,
                                        ...bodyTextStyle,
                                        fontWeight: 500,
                                    }}
                                >
                                    {t.reservation.note}
                                </p>
                                {[
                                    "name",
                                    "contact",
                                    "date",
                                    "time",
                                    "guests",
                                    "notes",
                                ].map((f) => (
                                    <div key={f} style={{ marginBottom: 12 }}>
                                        <label
                                            style={labelStyle}
                                            htmlFor={`r-${f}`}
                                        >
                                            {(t.reservation as any)[f]}
                                        </label>
                                        {f === "notes" ? (
                                            <textarea
                                                id={`r-${f}`}
                                                aria-required="false"
                                                aria-invalid={Boolean(
                                                    reservationErrors[f]
                                                )}
                                                placeholder={
                                                    (t.reservation as any)[f]
                                                }
                                                value={
                                                    (reservationForm as any)[f]
                                                }
                                                onInput={(e) => {
                                                    const value =
                                                        e.currentTarget.value
                                                    setReservationForm((p) => ({
                                                        ...p,
                                                        [f]: value,
                                                    }))
                                                }}
                                                style={{
                                                    ...inputStyle,
                                                    minHeight: 90,
                                                }}
                                            />
                                        ) : (
                                            <input
                                                id={`r-${f}`}
                                                type={
                                                    f === "date"
                                                        ? "date"
                                                        : f === "time"
                                                          ? "time"
                                                          : f === "guests"
                                                            ? "number"
                                                            : "text"
                                                }
                                                min={
                                                    f === "guests"
                                                        ? 1
                                                        : f === "date"
                                                          ? minHanoiDate
                                                          : undefined
                                                }
                                                aria-required="true"
                                                aria-invalid={Boolean(
                                                    reservationErrors[f]
                                                )}
                                                aria-describedby={
                                                    reservationErrors[f]
                                                        ? `rerr-${f}`
                                                        : undefined
                                                }
                                                placeholder={
                                                    (t.reservation as any)[f]
                                                }
                                                value={
                                                    (reservationForm as any)[f]
                                                }
                                                onInput={(e) => {
                                                    const value =
                                                        e.currentTarget.value
                                                    setReservationForm((p) => ({
                                                        ...p,
                                                        [f]: value,
                                                    }))
                                                }}
                                                style={inputStyle}
                                            />
                                        )}
                                        {reservationErrors[f] && (
                                            <div
                                                id={`rerr-${f}`}
                                                style={{
                                                    color: accentColor,
                                                    fontSize: 12,
                                                }}
                                            >
                                                {errorText(
                                                    reservationErrors[f]
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="submit"
                                    style={{
                                        minHeight: 44,
                                        border: "none",
                                        background: accentColor,
                                        color: "#191C19",
                                        padding: "10px 14px",
                                        ...ctaTextStyle,
                                        ...ctaTextStyle,
                                    }}
                                >
                                    {t.reservation.submit}
                                </button>
                                {reservationSubmitted && (
                                    <div style={{ marginTop: 16 }}>
                                        <div
                                            style={{
                                                ...labelStyle,
                                                fontSize: 20,
                                                lineHeight: 1.3,
                                                fontWeight: 700,
                                            }}
                                        >
                                            {t.reservation.summaryTitle}
                                        </div>
                                        <pre
                                            style={{
                                                whiteSpace: "pre-wrap",
                                                userSelect: "text",
                                                border: `1px solid ${textColor}`,
                                                padding: 12,
                                                margin: 0,
                                                fontFamily: uiFont,
                                            }}
                                        >
                                            {reservationSummary}
                                        </pre>
                                        <div
                                            style={{
                                                marginTop: 8,
                                                display: "flex",
                                                gap: 10,
                                                flexWrap: "wrap",
                                            }}
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    copyText(reservationSummary)
                                                        .then((ok) =>
                                                            startTransition(
                                                                () =>
                                                                    setReservationCopyStatus(
                                                                        ok
                                                                            ? "ok"
                                                                            : "fail"
                                                                    )
                                                            )
                                                        )
                                                        .catch(() =>
                                                            startTransition(
                                                                () =>
                                                                    setReservationCopyStatus(
                                                                        "fail"
                                                                    )
                                                            )
                                                        )
                                                }
                                                style={{
                                                    border: `1px solid ${textColor}`,
                                                    background: "transparent",
                                                    color: textColor,
                                                    padding: "10px 12px",
                                                    minHeight: 44,
                                                    fontSize: 16,
                                                    lineHeight: 1.4,
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {t.reservation.copyAgain}
                                            </button>
                                            <a
                                                href={zaloUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                style={{
                                                    color: accentColor,
                                                    fontSize: 16,
                                                    lineHeight: 1.6,
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {t.reservation.openZalo}
                                            </a>
                                        </div>
                                        <p
                                            role="status"
                                            aria-live="polite"
                                            style={{
                                                marginBottom: 0,
                                                ...bodyTextStyle,
                                            }}
                                        >
                                            {reservationCopyStatus === "ok"
                                                ? t.reservation.statusOk
                                                : reservationCopyStatus ===
                                                    "fail"
                                                  ? t.reservation.statusFail
                                                  : ""}
                                        </p>
                                    </div>
                                )}
                            </form>
                        ),
                        modalRoot
                    )
                ))}

            {modalRoot &&
                franchiseOpen &&
                createPortal(
                    modal(
                        t.franchiseForm.title,
                        () => closeDialog(setFranchiseOpen),
                        franchiseDialogRef,
                        <form noValidate onSubmit={franchiseSubmit}>
                            <div
                                style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 8,
                                    marginBottom: 10,
                                }}
                            >
                                {(["ko", "zh", "en", "vi"] as Lang[]).map(
                                    (l) => (
                                        <button
                                            key={`dlg-fra-${l}`}
                                            type="button"
                                            aria-label={`${t.fields.languageSwitch} ${defaultDict[l].langLabel}`}
                                            aria-pressed={l === lang}
                                            onClick={() =>
                                                startTransition(() =>
                                                    selectLanguage(l)
                                                )
                                            }
                                            style={{
                                                minHeight: 44,
                                                border: `1px solid ${textColor}`,
                                                background: "transparent",
                                                color:
                                                    l === lang
                                                        ? accentColor
                                                        : textColor,
                                                padding: "0 12px",
                                                fontSize: 14,
                                                lineHeight: 1.4,
                                                fontWeight: 700,
                                            }}
                                        >
                                            {defaultDict[l].langLabel}
                                        </button>
                                    )
                                )}
                            </div>
                            <p
                                style={{
                                    marginTop: 0,
                                    ...bodyTextStyle,
                                    fontWeight: 500,
                                }}
                            >
                                {t.franchiseForm.note}
                            </p>
                            {[
                                "name",
                                "contact",
                                "city",
                                "timing",
                                "message",
                            ].map((f) => (
                                <div key={f} style={{ marginBottom: 12 }}>
                                    <label
                                        style={labelStyle}
                                        htmlFor={`f-${f}`}
                                    >
                                        {(t.franchiseForm as any)[f]}
                                    </label>
                                    {f === "message" ? (
                                        <textarea
                                            id={`f-${f}`}
                                            aria-required="true"
                                            aria-invalid={Boolean(
                                                franchiseErrors[f]
                                            )}
                                            aria-describedby={
                                                franchiseErrors[f]
                                                    ? `ferr-${f}`
                                                    : undefined
                                            }
                                            placeholder={
                                                (t.franchiseForm as any)[f]
                                            }
                                            value={(franchiseForm as any)[f]}
                                            onInput={(e) => {
                                                const value =
                                                    e.currentTarget.value
                                                setFranchiseForm((p) => ({
                                                    ...p,
                                                    [f]: value,
                                                }))
                                            }}
                                            style={{
                                                ...inputStyle,
                                                minHeight: 90,
                                            }}
                                        />
                                    ) : (
                                        <input
                                            id={`f-${f}`}
                                            type="text"
                                            aria-required="true"
                                            aria-invalid={Boolean(
                                                franchiseErrors[f]
                                            )}
                                            aria-describedby={
                                                franchiseErrors[f]
                                                    ? `ferr-${f}`
                                                    : undefined
                                            }
                                            placeholder={
                                                (t.franchiseForm as any)[f]
                                            }
                                            value={(franchiseForm as any)[f]}
                                            onInput={(e) => {
                                                const value =
                                                    e.currentTarget.value
                                                setFranchiseForm((p) => ({
                                                    ...p,
                                                    [f]: value,
                                                }))
                                            }}
                                            style={inputStyle}
                                        />
                                    )}
                                    {franchiseErrors[f] && (
                                        <div
                                            id={`ferr-${f}`}
                                            style={{
                                                color: accentColor,
                                                fontSize: 12,
                                            }}
                                        >
                                            {errorText(franchiseErrors[f])}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button
                                type="submit"
                                style={{
                                    minHeight: 44,
                                    border: "none",
                                    background: accentColor,
                                    color: "#191C19",
                                    padding: "10px 14px",
                                    ...ctaTextStyle,
                                    ...ctaTextStyle,
                                }}
                            >
                                {t.franchiseForm.submit}
                            </button>
                            {franchiseSubmitted && (
                                <div style={{ marginTop: 16 }}>
                                    <div
                                        style={{
                                            ...labelStyle,
                                            fontSize: 20,
                                            lineHeight: 1.3,
                                            fontWeight: 700,
                                        }}
                                    >
                                        {t.franchiseForm.summaryTitle}
                                    </div>
                                    <pre
                                        style={{
                                            whiteSpace: "pre-wrap",
                                            userSelect: "text",
                                            border: `1px solid ${textColor}`,
                                            padding: 12,
                                            margin: 0,
                                            fontFamily: uiFont,
                                        }}
                                    >
                                        {franchiseSummary}
                                    </pre>
                                    <div
                                        style={{
                                            marginTop: 8,
                                            display: "flex",
                                            gap: 10,
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                copyText(franchiseSummary)
                                                    .then((ok) =>
                                                        startTransition(() =>
                                                            setFranchiseCopyStatus(
                                                                ok
                                                                    ? "ok"
                                                                    : "fail"
                                                            )
                                                        )
                                                    )
                                                    .catch(() =>
                                                        startTransition(() =>
                                                            setFranchiseCopyStatus(
                                                                "fail"
                                                            )
                                                        )
                                                    )
                                            }
                                            style={{
                                                border: `1px solid ${textColor}`,
                                                background: "transparent",
                                                color: textColor,
                                                padding: "10px 12px",
                                                minHeight: 44,
                                                fontSize: 16,
                                                lineHeight: 1.4,
                                                fontWeight: 700,
                                            }}
                                        >
                                            {t.franchiseForm.copyAgain}
                                        </button>
                                        <a
                                            href={zaloUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{
                                                color: accentColor,
                                                fontSize: 16,
                                                lineHeight: 1.6,
                                                fontWeight: 500,
                                            }}
                                        >
                                            {t.reservation.openZalo}
                                        </a>
                                    </div>
                                    <p
                                        role="status"
                                        aria-live="polite"
                                        style={{
                                            marginBottom: 0,
                                            ...bodyTextStyle,
                                        }}
                                    >
                                        {franchiseCopyStatus === "ok"
                                            ? t.reservation.statusOk
                                            : franchiseCopyStatus === "fail"
                                              ? t.reservation.statusFail
                                              : ""}
                                    </p>
                                </div>
                            )}
                        </form>
                    ),
                    modalRoot
                )}
        </div>
    )
}
