import { Box } from "@chakra-ui/react";
import { random, uniqueId } from "lodash";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import 'cal-heatmap/cal-heatmap.css';
import CalHeatmap from 'cal-heatmap'; 
// @ts-ignore
import Tooltip from 'cal-heatmap/plugins/Tooltip';
// @ts-ignore
import CalendarLabel from 'cal-heatmap/plugins/CalendarLabel';
import { singleton } from "./util";
import dayjs, { Dayjs } from "dayjs";

type HeatmapArg = {
  theme: 'light' | 'dark',
  start: Dayjs,
  highlight: Dayjs[],
  range: number,
  datas: [Dayjs, number][],
}
function Heatmap({theme, start, highlight, range, datas}: HeatmapArg) {
  const calender = useRef<() => [string, CalHeatmap]>(singleton(() => [uniqueId('heatmap-'), new CalHeatmap()]));
  useEffect(() => {
    console.log('theme chan', theme)
    calender.current()[1].paint({
      itemSelector: `#${calender.current()[0]}`,
      range,
      theme,
      domain: {
        type: 'month',
        label: { text: (date: Date) => {
          const idx = dayjs(new Date(date)).month()
          return ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'][idx]
        }, textAlign: 'start', position: 'top' },
        dynamicDimension: true,
        sort: 'desc',
        gutter: 12,
      },
      // subDomain为一个更小的粒度，必须小于domain（小太多会报错），可以认为是y轴（但会折几次），如github的贡献图的domain，subDomain就是月和日
      // subDomain 可以以
      subDomain: {
        type: 'ghDay', width: 14, height: 14, sort: 'desc', radius: 3,
        label: 'D',
      },
      date: {
        start: start.toDate(),
        locale: {
          weekStart: 1,
        },
        highlight: highlight.map(x=>x.toDate())
      },
      data: { 
        source: datas.map(([d, v]) => ({date: d.format('YYYY-MM-DD'), value: v})),
        x: 'date', y: 'value'
      },
    }, [
      [
        Tooltip,
        {
          // @ts-ignore
          text: function (date, value, dayjsDate) {
            return `${dayjsDate.format('YYYY-MM-DD')}: ${value ?? 0} 分`;
          },
        },
      ],
      [
        CalendarLabel,
        { 
          position: 'left',
          key: 'left',

          // @ts-ignore
          text: () => ['一', '', '三', '', '五', '', ''],
          textAlign: 'end',
          width: 30,
          padding: [24, 10, 0, 0],
        }
      ]
    ])
    return () => {
      calender.current()[1].destroy().catch(console.error)
    }
  }, [datas, start, theme, range])

  return (
    <>
    <Box id={calender.current()[0]}>

    </Box>
    </>
  )
}

export default Heatmap