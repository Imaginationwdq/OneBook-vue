<template>
    <div>
      <!-- 面包屑导航区域 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>数据统计</el-breadcrumb-item>
        <el-breadcrumb-item>数据报表</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 卡片视图区域 -->
      <el-card>
        <!-- 2. 为ECharts准备一个具备大小（宽高）的Dom -->
        <div id="main" style="width: 750px;height:400px;"></div>
      </el-card>
    </div>

</template>

<script>
  // 1. 导入 echarts
  import echarts from 'echarts'

  export default {
    data() {
      return {
      }
    },
    // 此时，页面上的元素，已经被渲染完毕了！
    mounted() {
      // 3. 基于准备好的dom，初始化echarts实例
      const myChart = echarts.init(document.getElementById('main'))
      // 4.指定图表的配置项和数据
      const option = {
        title: {
          text: '图书的销售数量'
        },
        tooltip: {},
        legend: {
          data: ['销量']
        },
        xAxis: {
          data: ["高等数学", "北鸢", "解忧杂货铺", "算法霸权", "未来简史", "白夜行"]
        },
        yAxis: {},
        series: [{
          name: '销量',
          type: 'bar',
          data: [777, 5690, 12003, 200, 887, 2125]
        }]
      }

      // 5.使用刚指定的配置项和数据显示图表。
      myChart.setOption(option)
    }
  }
</script>

<style lang="less" scoped>

</style>
