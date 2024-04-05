import dayjs, { Dayjs } from "dayjs";
import Pako from "pako";

function formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear().toString(); // 获取年份的最后两位
    let month = (date.getMonth() + 1).toString(); // 获取月份，并加1因为 getMonth 返回的是从0开始的值
    let day = date.getDate().toString(); // 获取日期

    // 补零操作，确保月份和日期为两位数
    if (month.length < 2) {
        month = '0' + month;
    }
    if (day.length < 2) {
        day = '0' + day;
    }

    // 拼接为 yyMMdd 格式的字符串
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
}


export function parseDatas(data: string): Record<string, number> {
    function parseDateFromYYMMDD(dateString: string): Date {
      // 获取当前的年份的世纪部分
      const currentYear = new Date().getFullYear();
      const currentCentury = Math.floor(currentYear / 100) * 100;
    
      // 解析 yyMMdd 格式的日期
      const yearPart = parseInt(dateString.substring(0, 2));
      const monthPart = parseInt(dateString.substring(2, 4)) - 1; // 月份从0开始
      const dayPart = parseInt(dateString.substring(4, 6));
    
      // 根据当前的世纪部分和解析出的年份部分确定完整的年份
      let year = currentCentury + yearPart;
      if (year > currentYear) {
          // 如果解析的年份大于当前年份，则可能是上个世纪的日期
          year = currentCentury - 100 + yearPart;
      }

      // 使用解析出的年份、月份和日期创建 Date 对象
      const date = new Date(year, monthPart, dayPart);
      
      return date;
    }
    // const search = window.location.search
    // if (search.length === 0 || search[0] != '?') {
    //   alert("没有查询参数！")
    //   throw new Error("没有查询参数！")
    // }
    if (data.length === 0) {
      return {}
    }
    const [date, values] = data.split('-')
    if (!date || date.length !== 6 || !values || values.length % 2 != 0) {
      alert('Illegal hash: \n' + data)
      return {}
    }
    let p = parseDateFromYYMMDD(date)
    console.log("startDate", p)
    console.log("days", values.length / 2)
  
    const result: Record<string, number> = {}
    for (let i = 0; i < values.length; i += 2) {
      const num = parseInt(values.substring(i, i + 2), 36)
      result[formatDateToYYYYMMDD(p)] = num
      p = new Date(+p + 24 * 60 * 60 * 1000)
    }
    return result
  }

export function parseDataFromSearch(): Record<string, number> {
    const search = window.location.search
    if (search.length === 0 || search[0] != '?') {
      alert("没有查询参数！")
      throw new Error("没有查询参数！")
    }
    return parseDatas(search.substring(1))
}

export function singleton<T>(supplier: () => T): () => T {
  let v: T | null = null
  return () => {
    if (v) {
      return v
    }
    v = supplier()
    return v
  }
}

export function days(startInclusive: Date | Dayjs, endInclusive: Date | Dayjs): Dayjs[] {
  const a = dayjs(startInclusive)
  const b = dayjs(endInclusive)
  if (a.isSame(b)) {
    return []
  }

  const dayDatas = []
  if (a.isBefore(b)) {
    for (let i = a; i.isBefore(b) || i.isSame(b); i = i.add(1, 'day')) {
        dayDatas.push(i)
    }
  } else {
    for (let i = b; i.isAfter(b) || i.isSame(b); i = i.subtract(1, 'day')) {
      dayDatas.push(i)
    }
  }
  return dayDatas
}

export function dayjsLe(left: Date | Dayjs, right: Date | Dayjs): boolean {
  const a = dayjs(left)
  const b = dayjs(right)
  return a.isBefore(b) || a.isSame(b)
}

const res = 'H4sIAAAAAAAACj3XUW7jMAwE0CtZpChK3fvfa5PYz38Dtx1HDyqQibjmlX/Xv/iGKZSwhBa2cJ4wLmEIIWgemofmoXloHpqH5tAcmkNzaA7NoTk0h+bQHJrzaa5rCCGkMIUSltDCFp7molE0ikbRKBpFo2gUjaJRNIpG0SgaRaNoFI2iUTSKRtGoVyOf5nW9IYQUplDCElrYwvOKhWVhWVgWloVlYVlYFpaFZWFZWBaWhWVhWVgWloVlYVlYFpaFpWk0jabRNJpG02gaTaNpNI2m0TSaRtNoGk2jaTSNptE0mkbTaBpNo2k0jabRNJpGvxouyb7eEEIKUyhhCS1s4XnFxrKxbCwby8aysWwsG8vGsrFsLBvLxrKxbCwby8aysWwsG8vGsrGc6w0hpDCFEpbQwhaeVxwsB8vBcrAcLAfLwXKwHCwHy8FysBwsB8vBcrAcLAfLwXKwnIdlXI/GJ4SQwhRKWEILWzhPGJqH5qF5aB6ah+aheWgemofm0ByaQ3NoDs2hOTSH5tAcml+N55KMcb0hhBSmUMISWtjC84qBZWAZWAaWgWVgGVgGloFlYBlYBpaBZWAZWAaWgWVgGVgGloElaASNoBE0gkbQCBpBI2gEjaARNIJG0AgaQSNoBI2gETSCRtAIGkEjaASNoBE0gka8Gvclyeu5JN8QQgpTKGEJLWzhPOFm+QbNQ/PQPDQPzUPz0Dw0D82hOTSH5tAcmkNzaA7NoTk0p2Yscb0hhBSmUMISWtjC84rAElgCS2AJLIElsASWwBJYAktgCSyBJbAElsASWAJLOns6ezp7Ons6ezp7Onteb8/zCdPZ09nT2dPZ09nT2dPZ09nT2dPZ09nT2dPZ09nT2dPZ09nT2fM9uyuRrkS6EvN6QwgpTKGEJbSwhecVE8vEMrFMLBPLxDKxTCwTy8QysUwsE8vEMrFMLBPLxDKxTCwTS9EoGkWjaBSNolE0ikbRKBpFo2gUjaJRNIpG0SgaRaNoFI2iUTSKRtEoGkWjaBSNejVcknW9IYQUplDCElrYwvOKhWVhWVgWloVlYVlYFpaFZWFZWBaWhWVhWVgWloVlYVlYFpaFpWk0jabRNJpG02gaTaNpNI2m0TSaRtNoGk2jaTSNptE0mkbTaBpNo2k0jabRNJpGvxouyb7eEEIKUyhhCS1s4XnFxrKxbCwby8aysWwsG8vGsrFsLBvLxrKxbCwby8aysWwsG8vGsrGc6w0hpDCFEpbQwhaeVxwsB8vBcrAcLAfLwXKwHCwHy8FysBwsB8vBcrAcLAfLwXKwPKMmjZo0atKoSaMmjZo0atKoSaMmjZo0atKoSaMmjZo0atKoSaMmjZo0atKoSaMmjZo0atKoSaMmjZo0atKoSaMmjZo0atKoSaMmjZo0atKoSaMmjZo0atKoSaMmjZo0atKoSaMmjZo0atKoSaMmjZo0avI3amLcSTWX7xfWue6k+wOz5p3W337+UDsa31kNmzRs0rBJwyYNm/wNmzHutDxqYQtPte+qlk1aNmnZpGWTlk1aNvlbNrHupJqJL6umTZo2+Zs2cQfVroovq6ZNmjZp2qRpk6bNNG2maTNNm2naTNNmmjbTtJmmzTRtpmkzTZtp2kzTZpo207SZps00baZpM02badpM02b+pk3GnT5XZdxp/uW+k/JQHspDeSj/yETe6WmP6w0hpDCFEpbQwhbOX/6qg02wCTbfOxNP0g0n4HwvzTh32m96TvC9NXk/4vO9Nt9/oGnkzN/I2fNO93Wfv5nzfMAPUMedPi/Ydzp/+/e3CeS7eWrd6Xcf52/01JPKby2h/8650/bo/J36JSbf3XMXMPnunufJ9EQ3ku/uWftOuj8ieX+6D8l4ko8eyj8ifYf5XKLv9hl3WA/Nd/zkk9S7Mt/1M54ffu7M+nV8B9C67vS5nE968L8TaDypPtD/Ac3zprD0GQAA'


// 使用 atob 解码 Base64 编码的字符串，得到二进制数据
const binaryData = atob(res);

console.log(Pako.ungzip(toUint8Array(binaryData), {to: 'string'}))

function toUint8Array(str: string) {
    const res = []
    // 逐字节读取字符串并打印字节表示
    for (let i = 0; i < str.length; i++) {
        // 获取字符的 Unicode 编码
        const charCode = str.charCodeAt(i);

        // 如果是 ASCII 字符，直接打印字节表示
        if (charCode <= 255) {
            res.push(charCode)
        } else {
            // 如果是非 ASCII 字符，则打印高位字节和低位字节
            res.push((charCode >> 8))
            res.push((charCode & 0xFF))
        }
    }
    return new Uint8Array(res)
}

console.log('??????', res.length, Pako.ungzip(toUint8Array(binaryData), {to: 'string'}).length)