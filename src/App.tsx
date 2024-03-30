import { Button, Container, Stat, StatArrow, StatGroup, StatHelpText, StatLabel, StatNumber, Text, VStack, useColorMode, useTheme } from '@chakra-ui/react'
import { useCallback, useEffect, useState } from 'react'
import Heatmap from './Heatmap'
import { useStat } from './stat'


function minuteToHour(minute: number): string {
    return (minute / 60).toFixed(1)
}


function App() {
  const stat = useStat()
  const { colorMode, toggleColorMode } = useColorMode()
  useEffect(() => {
    console.log(stat)
  }, [stat])

  const rateText = useCallback((rate: string) => {
    if (rate === '-') {
      return <><StatArrow type='increase' /> - %</>
    }
    if (rate[0] === '-') {
      return <><StatArrow type='decrease' /> {rate.substring(1)} %</>
    }
    return <><StatArrow type={rate === '0.00' ? 'decrease' : 'increase'} /> {rate} %</>
  }, [])


  return (
    <Container maxW='64em'>
      <Button onClick={toggleColorMode}>toggle</Button>
      <VStack alignItems={'stretch'} spacing={8}>
      <StatGroup mt={8} gap={8} >
        <Stat>
          <StatLabel>本日（小时）</StatLabel>
          <StatNumber>{minuteToHour(stat.day.thisPeriodNum)}</StatNumber>
          <StatHelpText>
            {rateText(stat.day.rate)}
          </StatHelpText>
        </Stat>

        <Stat>
          <StatLabel>近一周（小时）</StatLabel>
          <StatNumber>{minuteToHour(stat.week.thisPeriodNum)}</StatNumber>
          <StatHelpText>
            {rateText(stat.week.rate)}
          </StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>近一月（小时）</StatLabel>
          <StatNumber>{minuteToHour(stat.month.thisPeriodNum)}</StatNumber>
          <StatHelpText>
            {rateText(stat.month.rate)}
          </StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>近一年（小时）</StatLabel>
          <StatNumber>{minuteToHour(stat.year.thisPeriodNum)}</StatNumber>
          <StatHelpText>
            {rateText(stat.year.rate)}
          </StatHelpText>
        </Stat>
      </StatGroup>
      <Heatmap theme={colorMode} range={13} highlight={[stat.day.thisPeriod[1]]} start={stat.year.thisPeriod[0]} datas={stat.dayDatas}></Heatmap>
      <Text>
        todo 热力图的色阶和legend
      </Text>
      <Text>
        todo 近14天折线图
      </Text>

      </VStack>
      </Container>
  )
}

export default App
