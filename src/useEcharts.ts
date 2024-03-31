
import * as echarts from 'echarts';
import { uniqueId } from "lodash";
import { useEffect, useRef, useState } from "react";

export function useEcharts(option: echarts.EChartsOption, theme: 'dark' | 'light') {
    const [id] = useState(() => uniqueId('echarts-'))
    const chart = useRef<echarts.ECharts>()
    useEffect(() => {
        const elem = document.getElementById(id)
        if (!elem) {
            console.error(`element '#${id}' not found`)
            return
        }
        if (theme === 'dark') {
            chart.current = echarts.init(elem, 'dark')
        } else {
            chart.current = echarts.init(elem)
        }
        chart.current.setOption({
            ...option,
            backgroundColor: '',
        })
        return () => {
            chart.current?.dispose()
        }
    }, [theme, option])
    return {
        id
    }
}