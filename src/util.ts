import dayjs, { Dayjs } from "dayjs";

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