<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable>
            <el-button slot="append" icon="el-icon-search"  @click="getBookList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- table表格区域 -->
      <el-table :data="goodslist" border stripe>
        <!-- 展开行 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <div v-html='scope.row.bookDetail.remake'></div>
          </template>
        </el-table-column>
        <!-- 索引行 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="图书名称" prop="bookDetail.title"></el-table-column>
        <el-table-column label="图书价格(元)" prop="bookDetail.price"></el-table-column>
        <el-table-column label="作者" prop="bookDetail.author"></el-table-column>
        <el-table-column label="创建时间" prop="createTime">
          <template slot-scope="scope">
            {{scope.row.createTime | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"
                       @click="showGoodsEditorDialog(scope.row)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini"
                       @click="removeById(scope.row.bookId)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total" background>
      </el-pagination>

      <!-- 编辑弹出框 -->
      <el-dialog
        title="修改图书信息"
        :visible.sync="goodsEditordialogVisible"
        width="40%">
        <el-form :model="goodEditForm" :rules="goodsEditorFormRules" ref="goodsEditorFormRef">
          <el-form-item label="图书名称" prop="goods_name">
            <el-input v-model="goodEditForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="图书价格(元)" prop="goods_price">
            <el-input v-model="goodEditForm.goods_price" type="number"></el-input>
          </el-form-item>
          <el-form-item label="作者" prop="goods_author">
            <el-input v-model="goodEditForm.goods_author"></el-input>
          </el-form-item>
          <el-form-item label="图书分类" prop="goods_cat">
            <el-cascader
              expand-trigger="hover"
              :options="catelist"
              :props="cateProps"
              v-model="goodEditForm.goods_cat"
              @change="parentCateChanged"
              placeholder="试试搜索：数一"
              clearable
              filterable>
            </el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="goodsEditordialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addgoodsInfo">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        // 查询参数对象
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 5
        },
        // 商品列表
        goodslist: [],
        // 总数据条数
        total: 20,
        // 编辑商品的开关
        goodsEditordialogVisible: false,
        // 一行的数据
        goodEditForm: {},
        // 表单验证规则
        goodsEditorFormRules: {
          goods_name: [
            { required: true, message: '请输入图书名称', trigger: 'blur' }
          ],
          goods_price: [
            { required: true, message: '请输入图书价钱', trigger: 'blur' }
          ],
          goods_author: [
            { required: true, message: '请输入作者', trigger: 'blur' }
          ],
          goods_cat: [
            { required: true, message: '请选择图书分类', trigger: 'blur' }
          ]
        },
        // 商品分类列表
        catelist: [],
        cateProps: {
          value: 'categoryId',
          label: 'categoryName',
          children: 'children'
        }
      }
    },
    created() {
      this.getCatelist()
      this.getBookList()
    },
    methods: {
      parentCateChanged() {
      },
      // 获取图书列表
      getBookList() {
        const params = new URLSearchParams()
        params.append('page', this.queryInfo.pagenum)
        params.append('limit', this.queryInfo.pagesize)
        params.append('title', this.queryInfo.query)
        this.$http.post(`/onebook/booklist/list`, params)
          .then(({ data }) => {
            if (data && data.code === 0) {
              this.goodslist = data.page.list
              this.total = Number(data.page.totalCount)
              this.queryInfo.pagesize = Number(data.page.pageSize)
              this.queryInfo.pagenum = Number(data.page.currPage)
            } else {
              this.goodslist = []
              this.total = 0
            }
          })
      },
      // 获取商品分类列表
      getCatelist() {
        const params = new URLSearchParams()
        this.$http.post(`/onebook/category/treeList`, params)
          .then(({ data }) => {
            if (data && data.code === 0) {
              this.catelist = data.page.records
            } else {
              this.catelist = []
            }
          })
      },
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
      },
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
      },
      removeById(id) {
        this.$confirm('此操作将永久删除该图书, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const params = new URLSearchParams()
          params.append('bookId', id)
          this.$http.post(`/onebook/booklist/removeById`, params)
            .then(({ data }) => {
              if (data && data.code === 0) {
                this.getBookList()
                this.$message.success(data.msg)
              } else {
                this.$message.error(data.msg)
              }
            })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      },
      goAddpage() {
        this.$router.push('/goods/add')
      },
      // 展示编辑图书的对话框
      showGoodsEditorDialog(row) {
        const Eform = {
          goods_id: row.bookId,
          goods_name: row.bookDetail.title,
          goods_price: row.bookDetail.price,
          goods_author: row.bookDetail.author,
          goods_cat: row.bookDetail.categoryId
        }
        this.goodEditForm = Eform
        this.goodsEditordialogVisible = true
      },
      // 修改图书信息并提交
      addgoodsInfo() {
        this.$refs.goodsEditorFormRef.validate(valid => {
          if (!valid) return
          const params = new URLSearchParams()
          params.append('bookId', this.goodEditForm.goods_id)
          params.append('title', this.goodEditForm.goods_name)
          params.append('price', this.goodEditForm.goods_price)
          params.append('author', this.goodEditForm.goods_author)
          params.append('categoryId', this.goodEditForm.goods_cat)
          this.$http.post(`/onebook/bookdetail/updateBookDetail`, params)
            .then(({ data }) => {
              if (data && data.code === 0) {
                this.getBookList()
                this.$message.success(data.msg)
              } else {
                this.$message.error(data.msg)
              }
              // 关闭对话框
              this.goodsEditordialogVisible = false
            })
        })
      }
    }
  }
</script>

<style lang="less" scoped>
</style>
