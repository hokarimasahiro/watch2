function LED消灯 () {
    strip.showColor(neopixel.colors(NeoPixelColors.Black))
    strip.show()
}
function 時刻送信 () {
    rtc.getClock()
    serial.writeNumbers([
    rtc.getClockData(clockData.year),
    rtc.getClockData(clockData.month),
    rtc.getClockData(clockData.day),
    rtc.getClockData(clockData.weekday),
    rtc.getClockData(clockData.hour),
    rtc.getClockData(clockData.minute),
    rtc.getClockData(clockData.second)
    ])
}
function コントローラ処理 () {
    radio.setGroup(無線グループ)
    if (input.buttonIsPressed(Button.A)) {
        Y = Math.constrain(input.rotation(Rotation.Pitch) * -10, -512, 512)
        X = Math.constrain(input.rotation(Rotation.Roll) * 10, -512, 512)
    } else {
        X = 0
        Y = 0
    }
    radio.sendString("$," + X + "," + Y)
    ボタン番号()
    strip.showColor(color[buttonNo])
    strip.show()
    radio.sendNumber(buttonNo)
    radio.setGroup(0)
    basic.pause(50)
}
function 時計設定 (データ: string[]) {
    rtc.setClockData(clockData.year, parseFloat(データ[1]))
    rtc.setClockData(clockData.month, parseFloat(データ[2]))
    rtc.setClockData(clockData.day, parseFloat(データ[3]))
    rtc.setClockData(clockData.hour, parseFloat(データ[4]))
    rtc.setClockData(clockData.minute, parseFloat(データ[5]))
    rtc.setClockData(clockData.second, parseFloat(データ[6]))
    rtc.setClock()
}
function 音通信処理 () {
    if (input.buttonIsPressed(Button.A)) {
        radio.sendString("A")
        while (input.buttonIsPressed(Button.A)) {
        	
        }
    }
    if (input.buttonIsPressed(Button.B)) {
        radio.sendString("B")
        while (input.buttonIsPressed(Button.B)) {
        	
        }
    }
    if (pins.digitalReadPin(DigitalPin.P8) == 0) {
        music.play(music.tonePlayable(3000, music.beat(BeatFraction.Whole)), music.PlaybackMode.UntilDone)
        basic.pause(100)
        music.play(music.tonePlayable(3000, music.beat(BeatFraction.Quarter)), music.PlaybackMode.UntilDone)
        basic.pause(100)
        music.play(music.tonePlayable(3000, music.beat(BeatFraction.Quarter)), music.PlaybackMode.UntilDone)
        basic.pause(100)
        music.play(music.tonePlayable(3000, music.beat(BeatFraction.Quarter)), music.PlaybackMode.UntilDone)
        basic.pause(100)
        music.play(music.tonePlayable(3000, music.beat(BeatFraction.Quarter)), music.PlaybackMode.UntilDone)
        while (pins.digitalReadPin(DigitalPin.P8) == 0) {
        	
        }
    }
}
function 音通信初期化 () {
    radio.setGroup(33)
    LED初期化()
}
function ボタン番号 () {
    buttonNo = 0
    if (pins.digitalReadPin(DigitalPin.P8) == 0) {
        buttonNo += 1
    }
    if (pins.digitalReadPin(DigitalPin.P12) == 0) {
        buttonNo += 2
    }
    if (pins.digitalReadPin(DigitalPin.P13) == 0) {
        buttonNo += 4
    }
    if (input.isGesture(Gesture.Shake)) {
        buttonNo = 6
    }
}
function 時計処理 () {
    basic.pause(100)
    rtc.getClock()
    if (rtc.getClockData(clockData.minute) == 0 && rtc.getClockData(clockData.second) == 0) {
        pins.digitalWritePin(DigitalPin.P2, 1)
        basic.pause(200)
        pins.digitalWritePin(DigitalPin.P2, 0)
        basic.pause(800)
    }
    if (input.buttonIsPressed(Button.A)) {
        時刻表示(1)
    } else if (input.buttonIsPressed(Button.B)) {
        秒表示()
    } else if (input.isGesture(Gesture.Shake)) {
        時刻表示(0)
    } else {
        basic.clearScreen()
    }
    ボタン番号()
    if (buttonNo == 1) {
        時刻送信()
    }
}
function 時計初期化 () {
    pins.digitalWritePin(DigitalPin.P2, 0)
    pins.setPull(DigitalPin.P8, PinPullMode.PullUp)
    pins.setPull(DigitalPin.P12, PinPullMode.PullUp)
    pins.setPull(DigitalPin.P13, PinPullMode.PullUp)
    LED初期化()
    rtc.getClock()
    時刻表示(0)
}
serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    シリアルデータ = serial.readUntil(serial.delimiters(Delimiters.NewLine))
    if (シリアルデータ.charAt(0) == "g") {
        時刻送信()
    } else if (シリアルデータ.charAt(0) == "s") {
        時計設定(シリアルデータ.split(","))
    }
})
function LED表示 () {
    strip.showColor(neopixel.colors(NeoPixelColors.Orange))
    strip.show()
}
function 表示方向 () {
    if (input.rotation(Rotation.Pitch) <= -40) {
        watchfont.setRotatation(rotate.under)
    } else {
        watchfont.setRotatation(rotate.top)
    }
    if (input.rotation(Rotation.Roll) < -75) {
        watchfont.setRotatation(rotate.right)
    } else if (input.rotation(Rotation.Roll) > 75) {
        watchfont.setRotatation(rotate.left)
    }
}
function 音通信受信処理 (受信データ: string) {
    if (受信データ.includes("A")) {
        LED表示()
        watchfont.showIcon(
        "01110",
        "10001",
        "11111",
        "10001",
        "10001"
        )
        バイブレーション()
        LED消灯()
    } else if (受信データ.includes("B")) {
        LED表示()
        watchfont.showIcon(
        "11110",
        "10001",
        "11110",
        "10001",
        "11110"
        )
        バイブレーション()
        LED消灯()
    }
}
radio.onReceivedString(function (receivedString) {
    if (TYPE == 1) {
        if (radio.receivedPacket(RadioPacketProperty.SignalStrength) >= -70) {
            受信文字 = receivedString.split(",")
            if (受信文字[0] == "CQ") {
                radio.sendString("" + 受信文字[1] + "," + control.deviceName() + "," + convertToText(無線グループ))
            }
        }
    } else if (TYPE == 2) {
        音通信受信処理(receivedString)
    }
})
function バイブレーション () {
    pins.digitalWritePin(DigitalPin.P2, 1)
    basic.pause(200)
    pins.digitalWritePin(DigitalPin.P2, 0)
}
function 秒表示 () {
    表示方向()
    watchfont.showNumber2(rtc.getClockData(clockData.second))
}
function コントローラ初期化 () {
    無線グループ = Math.abs(control.deviceSerialNumber()) % 98 + 1
    watchfont.showNumber2(無線グループ)
    radio.setTransmitPower(7)
    LED初期化()
}
function LED初期化 () {
    strip = neopixel.create(DigitalPin.P1, 4, NeoPixelMode.RGB)
    strip.setBrightness(32)
    color = [
    neopixel.colors(NeoPixelColors.Black),
    neopixel.colors(NeoPixelColors.Red),
    neopixel.colors(NeoPixelColors.Green),
    neopixel.colors(NeoPixelColors.Blue),
    neopixel.colors(NeoPixelColors.Yellow),
    neopixel.colors(NeoPixelColors.Violet),
    neopixel.colors(NeoPixelColors.White),
    neopixel.colors(NeoPixelColors.Orange)
    ]
}
function 時刻表示 (タイプ: number) {
    時刻送信()
    if (タイプ == 0) {
        表示方向()
        watchfont.showNumber2(rtc.getClockData(clockData.hour))
        basic.pause(1000)
        basic.clearScreen()
        basic.pause(200)
        watchfont.showNumber2(rtc.getClockData(clockData.minute))
        basic.pause(1000)
        basic.clearScreen()
        basic.pause(500)
    } else if (タイプ == 1) {
        basic.showString("" + rtc.getClockData(clockData.hour) + ":" + rtc.getClockData(clockData.minute))
    }
}
let 受信文字: string[] = []
let シリアルデータ = ""
let buttonNo = 0
let color: number[] = []
let X = 0
let Y = 0
let 無線グループ = 0
let strip: neopixel.Strip = null
let TYPE = 0
pins.digitalWritePin(DigitalPin.P2, 0)
pins.setPull(DigitalPin.P5, PinPullMode.PullUp)
pins.setPull(DigitalPin.P11, PinPullMode.PullUp)
pins.setPull(DigitalPin.P8, PinPullMode.PullUp)
pins.setPull(DigitalPin.P12, PinPullMode.PullUp)
pins.setPull(DigitalPin.P13, PinPullMode.PullUp)
TYPE = 1 - pins.digitalReadPin(DigitalPin.P5)
TYPE += (1 - pins.digitalReadPin(DigitalPin.P11)) * 2
watchfont.showNumber2(TYPE)
while (pins.digitalReadPin(DigitalPin.P5) == 0 || pins.digitalReadPin(DigitalPin.P11) == 0) {
	
}
if (TYPE == 1) {
    コントローラ初期化()
} else if (TYPE == 2) {
    音通信初期化()
} else {
    時計初期化()
}
serial.redirectToUSB()
basic.forever(function () {
    if (TYPE == 1) {
        コントローラ処理()
    } else if (TYPE == 2) {
        音通信処理()
    } else {
        時計処理()
    }
})
