import { Box, Button, Card, CardBody, CardHeader, Container, Flex, Grid, GridItem, HStack, Heading, Progress, SimpleGrid, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Stat, StatArrow, StatGroup, StatHelpText, StatLabel, StatNumber, Tag, TagLabel, Text, Tooltip, VStack, Wrap, WrapItem, useColorMode, useTheme } from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Heatmap from './Heatmap'
import { useStat } from './useStat'
import * as echarts from 'echarts'
import { EChartsOption } from 'echarts'
import { useEcharts } from './useEcharts'
import { Dayjs } from 'dayjs'
import _ from 'lodash'
import * as d3 from "d3";
import { dayjsLe } from './util'

const EXPECT = 2

function minuteToHour(minute: number): string {
  return (minute / 60).toFixed(1)
}

function App() {
  const stat = useStat()
  const { colorMode, toggleColorMode } = useColorMode()
  const fourteenDaysEChartOption = useMemo(() => fourteenDaysLineChart(stat.today, stat.dayDatas), [stat])
  const twelveMonthLineChartOption = useMemo(() => twelveMonthLineChart(stat.today, stat.dayDatas), [stat])
  const twelveWeekLineChartOption = useMemo(() => twelveWeekLineChart(stat.today, stat.dayDatas), [stat])
  const { id: fourteenDaysEChartId } = useEcharts(fourteenDaysEChartOption, colorMode)
  const { id: twelveMonthLineChartId } = useEcharts(twelveMonthLineChartOption, colorMode)
  const { id: twelveWeekLineChartId } = useEcharts(twelveWeekLineChartOption, colorMode)

  const rateText = useCallback((rate: string) => {
    if (rate === '-') {
      return <><StatArrow type='increase' /> - %</>
    }
    if (rate[0] === '-') {
      return <><StatArrow type='decrease' /> {rate.substring(1)} %</>
    }
    return <><StatArrow type={rate === '0.00' ? 'decrease' : 'increase'} /> {rate} %</>
  }, [])

  const [range, setRange] = useState(17)

  const dayExpect = useMemo(() => {
    const lastHours = EXPECT * 365 - +minuteToHour(stat.year.thisNaturalNum)
    console.log('lastHours', lastHours)
    const diff = stat.year.thisNatural[0].add(1, 'year').diff(stat.today, 'day')
    return lastHours / diff
  }, [stat.year.thisNaturalNum, stat.year.thisNatural[1], stat.today])
  console.log('dayExpect', dayExpect)
  return (
    <Container maxW='96em'>
      {/* <AnotherProgress /> */}
      <Button onClick={toggleColorMode}>toggle</Button>
      <Flex flexWrap={'wrap'} gap={4}>

        <Box flexBasis={"100%"}>
          <Card>
            <CardBody>
              <HStack>
                <Stat flexBasis={'11em'} flexGrow={0} >
                  <StatLabel>本日（小时）</StatLabel>
                  <StatNumber>{minuteToHour(stat.day.thisNaturalNum)} / {EXPECT} ({dayExpect.toFixed(1)})</StatNumber>
                  <StatHelpText>
                    {rateText(stat.day.realRate)}
                  </StatHelpText>
                </Stat>
                <MyProgress max={dayExpect} expect={EXPECT} value={+minuteToHour(stat.day.thisNaturalNum)}></MyProgress>
              </HStack>
            </CardBody>
          </Card>
        </Box>

        <Box flexBasis={0} flexGrow={1}>
          <Card>
            <CardBody>
              <VStack alignItems={'stretch'} spacing={8}>
              <HStack>
                <Stat flexBasis={'8em'} flexGrow={0}>
                  <StatLabel>近一周（小时）</StatLabel>
                  <StatNumber>{minuteToHour(stat.week.thisRealNum)}</StatNumber>
                  <StatHelpText>
                    {rateText(stat.week.realRate)}
                  </StatHelpText>
                </Stat>
                <Stat flexBasis={'11em'} flexGrow={0}>
                  <StatLabel>本周（小时）</StatLabel>
                  <StatNumber>{minuteToHour(stat.week.thisNaturalNum)} / {EXPECT * 7} ({(dayExpect * 7).toFixed(0)})</StatNumber>
                  <StatHelpText>
                    {rateText(stat.week.naturalRate)}
                  </StatHelpText>
                </Stat>
                <MyProgress max={dayExpect * 7} expect={(stat.today.diff(stat.week.thisNatural[0], 'day') + 1) * EXPECT} value={+minuteToHour(stat.week.thisNaturalNum)}></MyProgress>
              </HStack>
              <HStack>
                <Stat flexBasis={'8em'} flexGrow={0}>
                  <StatLabel>近一月（小时）</StatLabel>
                  <StatNumber>{minuteToHour(stat.month.thisRealNum)}</StatNumber>
                  <StatHelpText>
                    {rateText(stat.month.realRate)}
                  </StatHelpText>
                </Stat>
                <Stat flexBasis={'11em'} flexGrow={0}>
                  <StatLabel>本月（小时）</StatLabel>
                  <StatNumber>{minuteToHour(stat.month.thisNaturalNum)} / {EXPECT * 30} ({(dayExpect * 30).toFixed(0)})</StatNumber>
                  <StatHelpText>
                    {rateText(stat.month.naturalRate)}
                  </StatHelpText>
                </Stat>
                <MyProgress max={dayExpect * 30} expect={(stat.today.diff(stat.month.thisNatural[0], 'day') + 1) * EXPECT} value={+minuteToHour(stat.month.thisNaturalNum)}></MyProgress>
              </HStack>

              <HStack>
                <Stat flexBasis={'8em'} flexGrow={0}>
                  <StatLabel>近一年（小时）</StatLabel>
                  <StatNumber>{minuteToHour(stat.year.thisRealNum)}</StatNumber>
                  <StatHelpText>
                    {rateText(stat.year.realRate)}
                  </StatHelpText>
                </Stat>

                <Stat flexBasis={'11em'} flexGrow={0}>
                  <StatLabel>本年（小时）</StatLabel>
                  <StatNumber>{minuteToHour(stat.year.thisNaturalNum)} / {EXPECT * 365} </StatNumber>
                  <StatHelpText>
                    {rateText(stat.year.naturalRate)}
                  </StatHelpText>
                </Stat>
                <MyProgress max={EXPECT * 365} expect={(stat.today.diff(stat.year.thisNatural[0], 'day') + 1) * EXPECT} value={+minuteToHour(stat.year.thisNaturalNum)}></MyProgress>
              </HStack>
              </VStack>
              
            </CardBody>
          </Card>
        </Box>

        

      <Card flexBasis={"0"} flexGrow={1}>
        <CardBody>
        <Box height={"100%"} id={fourteenDaysEChartId}></Box>
        </CardBody>
      </Card>

      <Card flexBasis={"100%"} flexGrow={1}>
        <CardBody>
          
        <VStack>
        {/* <Slider min={1} max={12} step={1} value={range} onChange={setRange} size='sm'>
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb boxSize={6} />
        </Slider> */}
        <Heatmap theme={colorMode} range={range} highlight={[stat.today]} start={stat.today.subtract(range - 1, 'month').add(1, 'day')} datas={stat.dayDatas}></Heatmap>
      
      </VStack>  
      
      </CardBody>
      </Card>
      


      <Card flexBasis={"0"} flexGrow={1}>
        <CardBody>
        <Box height={"350px"} id={twelveWeekLineChartId}></Box>
        </CardBody>
      </Card>

        

      <Card flexBasis={"0"} flexGrow={1}>
        <CardBody>
        <Box height={"350px"} id={twelveMonthLineChartId}></Box>
        </CardBody>
      </Card>


      </Flex>
      <VStack alignItems={'stretch'} spacing={8}>

        <Text>
          TODO 各种max，绘画时间最多的自然天，周，月
        </Text>

        <Text>
          TODO 进度条换成堆叠的
        </Text>

      </VStack>
    </Container>
  )
}

export default App

function fourteenDaysLineChart(today: Dayjs, dayDatas: [Dayjs, number][]): EChartsOption {
  const fourteenDaysAgo = today.subtract(27, 'day')
  const [dates, values] = _(dayDatas)
    .filter(([date]) => dayjsLe(date, today) && dayjsLe(fourteenDaysAgo, date))
    .map(([date, value]) => [date.format('MM-DD'), value] as [string, number])
    .reverse()
    .unzip().value() as [string[], number[]]
  const average = values.length === 0 ? 0 : _(values).sum() / values.length
  return {
    title: {
      text: '近 28 天每日绘画时间（分）'
    },
    tooltip: {
      trigger: 'item',
    },
    xAxis: {
      type: 'category',
      data: dates
    },
    yAxis: {
      type: 'value',
      // max: 300,
      interval: 30,
      max: (v) => v.max > EXPECT * 60 ? (Math.floor(v.max / 30) + 1) * 30 : (EXPECT * 60 + 30)
    },
    series: [
      {
        data: values,
        type: 'line',
        smooth: true,
        // sampling: 'average',
        symbolSize: 8,
        markLine: {
          data: [{
            name: '期望',
            yAxis: EXPECT * 60,
          }, {
            type: 'average',
            name: '平均值',
            lineStyle: {
              color: average >= EXPECT * 60 ? '' : 'red'
            }
          }],
        }
      }
    ]
  }
}

function twelveMonthLineChart(today: Dayjs, dayDatas: [Dayjs, number][]): EChartsOption {
  const months: Set<string> = new Set()
  for (let i = today.subtract(11, 'month'); dayjsLe(i, today); i = i.add(1, 'month')) {
    months.add(i.format('YY-MM'))
  }
  const v = _.groupBy(dayDatas.map(([d, v]) => [d.format('YY-MM'), v] as [string, number]).filter(([date,]) => months.has(date)), d => d[0])
  const datas: [string, string][] = []
  for (const month of Object.keys(v).sort((a, b) => b.localeCompare(a))) {
    datas.push([month, (v[month].map(x => x[1]).reduce((acc, x) => acc + x, 0) / 60).toFixed(2)])
  }

  const average = datas.length === 0 ? 0 : _(datas.map(x => x[1])).sum() / datas.length
  return {
    title: {
      text: '近 12 月绘画时间（小时）'
    },
    tooltip: {
      trigger: 'item',
    },
    xAxis: {
      type: 'category',
      data: datas.map(x => x[0])
    },
    yAxis: {
      type: 'value',
      // max: 300,
      interval: 10,
      max: (v) => v.max > EXPECT * 30 ? (Math.floor(v.max / 10) + 1) * 10 : (EXPECT * 30 + 10)
    },
    series: [
      {
        data: datas.map(x => x[1]),
        type: 'line',
        smooth: true,
        // sampling: 'average',
        symbolSize: 8,
        markLine: {
          data: [{
            name: '期望',
            yAxis: EXPECT * 30,
          }, {
            type: 'average',
            name: '平均值',
            lineStyle: {
              color: average >= EXPECT * 30 ? '' : 'red'
            }
          }],
        }
      }
    ]
  }
}

function twelveWeekLineChart(today: Dayjs, dayDatas: [Dayjs, number][]): EChartsOption {
  const thisWeekStart = today.day() === 0 ? today.subtract(1, 'week').add(1, 'day'): today.day(1)
  const thisWeek = [thisWeekStart, thisWeekStart.add(1, 'week').subtract(1, 'day')] as const
  
  const weeks: [Dayjs, Dayjs, string][] = []
  for (let i = 0; i < 12; i++) {
    const [start, end] = thisWeek.map(x=>x.subtract(i, 'week'))
    weeks.push([start, end, `${start.format('MM-DD')}~${end.format('MM-DD')}`])
  }
  weeks.reverse()

  const datas: number[] = new Array(weeks.length).fill(0)

  dayDatas.forEach(([date, v]) => {
    const idx = _.findIndex(weeks, ([start, end]) => dayjsLe(start, date) && dayjsLe(date, end))!
    datas[idx] += v / 60
  })

  const average = datas.length === 0 ? 0 : _(datas).sum() / datas.length
  return {
    title: {
      text: '近 12 周绘画时间（小时）'
    },
    tooltip: {
      trigger: 'item',
    },
    xAxis: {
      type: 'category',
      data: weeks.map(x=>x[2]).reverse()
    },
    yAxis: {
      type: 'value',
      // max: 300,
      interval: 2,
      max: (v) => v.max > EXPECT * 7 ? (Math.floor(v.max / 3) + 1) * 3 : (EXPECT * 7 + 2)
    },
    series: [
      {
        data: datas.reverse().map(x=>x.toFixed(2)),
        type: 'line',
        smooth: true,
        // sampling: 'average',
        symbolSize: 8,
        markLine: {
          data: [{
            name: '期望',
            yAxis: EXPECT * 7,
          }, {
            type: 'average',
            name: '平均值',
            lineStyle: {
              color: average >= EXPECT * 7 ? '' : 'red'
            }
          }],
        }
      }
    ]
  }
}

function MyProgress({ max, value, expect }: { max: number, value: number, expect?: number }) {
  const MyTag = useCallback(({ position, label, colorScheme, z = 1 }: { z?: number, colorScheme: string, position: number, label: string }) => (<Tag _after={{
    content: `''`,
    position: 'absolute',
    transform: 'translateX(-50%)',
    top: '100%',
    bottom: '-10px',
    left: '50%',
    zIndex: z,
    borderWidth: '5px',
    borderStyle: 'solid',
    borderColor: 'var(--tag-bg) transparent transparent transparent'
  }}
    variant='solid'
    zIndex={z}
    colorScheme={colorScheme}
    position={'absolute'}
    top={"-120%"}
    right={0}
    bottom={"120%"}
    left={`${(position >= 100 ? 100 : position).toFixed(2)}%`}
    width={'fit-content'}
    transform={"translate(-50%, -50%)"}><TagLabel>{label}</TagLabel></Tag>), [])
  console.log(max, value, expect)
  return (
    <Box flexGrow={1} position={'relative'}>
      {expect ?
        <MyTag position={expect / max * 100} label={`Expect: ${(expect / max * 100).toFixed(0)}%`} colorScheme='blue' z={0}></MyTag>
        : <></>}

      <MyTag position={value / max * 100} label={`${(value / max * 100).toFixed(0)}%`} colorScheme={expect ? value < expect ? 'red' : 'blue' : value >= max ? 'blue' : 'red'} z={1}></MyTag>
      <Progress max={max} size='lg' isAnimated flexGrow={1} hasStripe value={value} />
    </Box>
  )
}

function AnotherProgress() {
  const ref = useRef<SVGSVGElement>(undefined as unknown as SVGSVGElement);
  useEffect(() => {
    // 准备数据
    const data = [
      { category: '每天', actualValue: 50, expectedValue: 70 },
      { category: '每周', actualValue: 80, expectedValue: 90 },
      { category: '每月', actualValue: 60, expectedValue: 75 }
    ];

    // 创建 SVG 容器
    const svgWidth = 600;
    const svgHeight = 400;
    const svg = d3.select(ref.current)
      .append('svg')
      .attr('width', svgWidth)
      .attr('height', svgHeight);

    // 定义比例尺
    const maxValue = Math.max(...data.map(d => d.actualValue), ...data.map(d => d.expectedValue));
    const xScale = d3.scaleLinear()
      .domain([0, maxValue])
      .range([0, svgWidth]);

    // 创建堆叠进度条图
    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', (d, i) => i * 100)
      .attr('width', d => xScale(d.actualValue))
      .attr('height', 50)
      .attr('fill', 'steelblue');

    // 添加标识期望值的线
    const expectedLine = svg.append('line')
      .attr('x1', xScale(70)) // 期望值为 70，可以根据实际情况调整
      .attr('y1', 0)
      .attr('x2', xScale(70))
      .attr('y2', svgHeight)
      .attr('stroke', 'red')
      .attr('stroke-width', 2);

    // 添加坐标轴和其他标签
    const xAxis = d3.axisBottom(xScale);
    svg.append('g')
      .attr('transform', `translate(0, ${svgHeight - 20})`)
      .call(xAxis);

    // 添加标题
    svg.append('text')
      .attr('x', svgWidth / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '20px')
      .text('堆叠进度条图（实际值 vs. 期望值）');
  }, [])

  return <svg ref={ref}></svg>
}