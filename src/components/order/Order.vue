<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单列表数据 -->
      <el-table :data="orderlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send">
          <template slot-scope="scope">
            <template>
              {{scope.row.is_send}}
            </template>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
<!--          <template slot-scope="scope">-->
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showBox"></el-button>
            <el-button size="mini" type="success" icon="el-icon-location" @click="showProgressBox"></el-button>
<!--          </template>-->
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total" background>
      </el-pagination>

      <!-- 修改地址的对话框 -->
      <el-dialog title="修改地址" :visible.sync="addressVisible" width="50%" @close="addressDialogClosed">
        <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
          <el-form-item label="省市区/县" prop="address1">
            <el-cascader placeholder="试试搜索：北京" :options="cityData" filterable v-model="addressForm.address1" clearable></el-cascader>
          </el-form-item>
          <el-form-item label="学校" prop="school">
            <el-select v-model="addressForm.school" filterable placeholder="请选择学校">
              <el-option
                v-for="item in schoolData"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input v-model="addressForm.address2"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAddressInfo">确 定</el-button>
      </span>
      </el-dialog>

      <!-- 展示物流进度的对话框 -->
      <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
        <!-- 时间线 -->
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in activities"
            :key="index"
            :icon="activity.icon"
            :type="activity.type"
            :color="activity.color"
            :size="activity.size"
            :timestamp="activity.timestamp">
            {{activity.content}}
          </el-timeline-item>
        </el-timeline>
      </el-dialog>

    </el-card>
  </div>
</template>

<script>
  import cityData from './citydata'
  export default {
    data() {
      return {
        // 查询参数对象
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 5
        },
        total: 15,
        orderlist: [
          { order_number: '5sd45s4d5s5d45s', order_price: '23.6', pay_status: '1', is_send: '是', create_time: 1554005464455 },
          { order_number: 'fdf1114d5s5d45s', order_price: '13.2', pay_status: '1', is_send: '是', create_time: 22222464455 },
          { order_number: 'fryf5s4d5s5d45s', order_price: '3.6', pay_status: '2', is_send: '否', create_time: 45454464455 },
          { order_number: '5sd45s12315d45s', order_price: '16', pay_status: '1', is_send: '否', create_time: 1999945464455 },
          { order_number: '5sd44524455d45s', order_price: '19.9', pay_status: '2', is_send: '是', create_time: 888888464455 },
          { order_number: 'dd4522225s55445', order_price: '7.5', pay_status: '1', is_send: '是', create_time: 77778464455 }
        ],
        addressVisible: false,
        addressForm: {
          address1: [],
          school: '',
          address2: ''
        },
        addressFormRules: {
          address1: [
            { required: true, message: '请选择省市区县', trigger: 'blur' }
          ],
          school: [
            { required: true, message: '请选择学校', trigger: 'blur' }
          ],
          address2: [
            { required: true, message: '请填写详细地址', trigger: 'blur' }
          ]
        },
        cityData: cityData,
        // 全国学校名称
        schoolData: [
          { value: '河南财经政法大学', label: '河南财经政法大学' },
          { value: '河南农业大学', label: '河南农业大学' },
          { value: '河南工业大学', label: '河南工业大学' }
        ],
        progressVisible: false,
        activities: [
          { content: '已领取，订单完成', timestamp: '2018-04-5 12:46' },
          { content: '已到河南财经政法大学站点，待领取', timestamp: '2018-04-04 12:46', color: '#0bbd87' },
          { content: '未发货，未到指定地点', timestamp: '2018-04-03 20:46', color: '#0bbd87' }
        ]
      }
    },
    methods: {
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
      },
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
      },
      // 展示修改地址的对话框
      showBox() {
        this.addressVisible = true
      },
      // 修改地址信息并提交
      editAddressInfo() {
        this.$refs.addressFormRef.validate(valid => {
          if (!valid) return
          // 关闭对话框
          this.addressVisible = false
          // 提示修改成功
          this.$message.success('更新地址信息成功！')
        })
      },
      // 监听修改地址的关闭
      addressDialogClosed() {
        this.$refs.addressFormRef.resetFields()
      },
      // 展示物流进度的对话框
      showProgressBox() {
        this.progressVisible = true
      }
    }
  }
</script>

<style lang="less" scoped>
</style>
