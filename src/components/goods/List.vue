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
            <el-button slot="append" icon="el-icon-search"></el-button>
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
            <p>{{scope.row.goods_introduce}}</p>
          </template>
        </el-table-column>
        <!-- 索引行 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="图书名称" prop="goods_name"></el-table-column>
        <el-table-column label="图书原价格(元)" prop="goods_oldPrice"></el-table-column>
        <el-table-column label="图书售价(元)" prop="goods_curPrice"></el-table-column>
        <el-table-column label="图书新旧程度">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.goods_condition === 100" type="success">全新</el-tag>
            <el-tag v-if="scope.row.goods_condition === 99" type="success">99新</el-tag>
            <el-tag v-if="scope.row.goods_condition === 90" type="success">9成新</el-tag>
            <el-tag v-if="scope.row.goods_condition === 70" type="success">7成新</el-tag>
            <el-tag v-if="scope.row.goods_condition === 50" type="success">5成新</el-tag>
            <el-tag v-if="scope.row.goods_condition === 30" type="success">3成新</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="图书涂抹程度">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.goods_paint === 0" type="success">无涂抹</el-tag>
            <el-tag v-if="scope.row.goods_paint === 5" type="success">一点点</el-tag>
            <el-tag v-if="scope.row.goods_paint === 10" type="success">不多</el-tag>
            <el-tag v-if="scope.row.goods_paint === 50" type="success">多</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="图书笔记数量">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.goods_note === 100" type="success">满满的笔记</el-tag>
            <el-tag v-if="scope.row.goods_note === 50" type="success">半本笔记</el-tag>
            <el-tag v-if="scope.row.goods_note === 20" type="success">少量的笔记</el-tag>
            <el-tag v-if="scope.row.goods_note === 0" type="success">没有笔记</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="图书分类" prop="goods_cat"></el-table-column>
        <el-table-column label="创建时间" prop="add_time">
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showGoodsEditorDialog(scope.row)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.goods_id)"></el-button>
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
          <el-form-item label="图书原价" prop="goods_oldPrice">
            <el-input v-model="goodEditForm.goods_oldPrice" type="number"></el-input>
          </el-form-item>
          <el-form-item label="图书售价" prop="goods_curPrice">
            <el-input v-model="goodEditForm.goods_curPrice" type="number"></el-input>
          </el-form-item>
          <el-form-item label="图书新旧程度" prop="goods_condition">
            <el-radio-group v-model="goodEditForm.goods_condition">
              <el-radio label="100">全新</el-radio>
              <el-radio label="99">99新</el-radio>
              <el-radio label="90">9成新</el-radio>
              <el-radio label="70">7成新</el-radio>
              <el-radio label="50">5成新</el-radio>
              <el-radio label="30">3成新</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="图书涂抹程度" prop="goods_paint">
            <el-radio-group v-model="goodEditForm.goods_paint">
              <el-radio label="0">无涂抹</el-radio>
              <el-radio label="5">一点点</el-radio>
              <el-radio label="10">不多</el-radio>
              <el-radio label="50">多</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="图书笔记数量" prop="goods_note">
            <el-radio-group v-model="goodEditForm.goods_note">
              <el-radio label="100">满满的笔记</el-radio>
              <el-radio label="50">半本笔记</el-radio>
              <el-radio label="20">少量的笔记</el-radio>
              <el-radio label="0">没有笔记</el-radio>
            </el-radio-group>
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
              change-on-select
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
        goodslist: [
          { id: '1', goods_name: '北鸢', goods_oldPrice: '22.7', goods_curPrice: '56', goods_condition: 90, goods_paint: 5, goods_note: 20, goods_introduce: '一本好书', goods_cat: '文学作品/经典小说', add_time: 1605514345477 },
          { id: '2', goods_name: '反脆弱', goods_oldPrice: '23', goods_curPrice: '77', goods_condition: 100, goods_paint: 0, goods_note: 50, goods_introduce: '一本好书', goods_cat: '文学作品/经典小说', add_time: 1456222245477 },
          { id: '3', goods_name: '金翅雀', goods_oldPrice: '14', goods_curPrice: '45', goods_condition: 50, goods_paint: 10, goods_note: 100, goods_introduce: '一本好书', goods_cat: '文学作品/经典小说', add_time: 1605577775477 },
          { id: '4', goods_name: '解忧杂货店', goods_oldPrice: '7.8', goods_curPrice: '25', goods_condition: 70, goods_paint: 50, goods_note: 20, goods_introduce: '一本好书', goods_cat: '文学作品/经典小说', add_time: 1605514345477 },
          { id: '5', goods_name: '岛上书屋', goods_oldPrice: '9.6', goods_curPrice: '34', goods_condition: 99, goods_paint: 5, goods_note: 0, goods_introduce: '一本好书', goods_cat: '文学作品/经典小说', add_time: 1555514345477 }
          ],
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
          goods_oldPrice: [
            { required: true, message: '请输入图书原价', trigger: 'blur' }
          ],
          goods_curPrice: [
            { required: true, message: '请输入图书售价', trigger: 'blur' }
          ],
          goods_condition: [
            { required: true, message: '请选择图书新旧程度', trigger: 'blur' }
          ],
          goods_paint: [
            { required: true, message: '请选择图书涂抹程度', trigger: 'blur' }
          ],
          goods_note: [
            { required: true, message: '请选择图书笔记数量', trigger: 'blur' }
          ],
          goods_cat: [
            { required: true, message: '请选择图书分类', trigger: 'blur' }
          ]
        },
        // 商品分类列表
        catelist: [
          { cat_id: '1', cat_name: '考研用书', cat_deleted: false, cat_level: 0, children: [{ cat_id: '11', cat_name: '线代', cat_deleted: false, cat_level: 1, children: [] }, { cat_id: '12', cat_name: '高数', cat_deleted: false, cat_level: 1, children: [{ cat_id: '121', cat_name: '数一', cat_deleted: false, cat_level: 2 }, { cat_id: '122', cat_name: '数二', cat_deleted: false, cat_level: 2 }, { cat_id: '123', cat_name: '数三', cat_deleted: false, cat_level: 2 }] }, { cat_id: '13', cat_name: '英语', cat_deleted: false, cat_level: 1, children: [] }] },
          { cat_id: '2', cat_name: '公务员考试', cat_deleted: false, cat_level: 0, children: [] },
          { cat_id: '3', cat_name: '公务员考试', cat_deleted: false, cat_level: 0, children: [] },
          { cat_id: '4', cat_name: '公务员考试', cat_deleted: false, cat_level: 0, children: [] },
          { cat_id: '5', cat_name: '公务员考试', cat_deleted: false, cat_level: 0, children: [] },
          { cat_id: '6', cat_name: '公务员考试', cat_deleted: false, cat_level: 0, children: [] },
          { cat_id: '7', cat_name: '公务员考试', cat_deleted: false, cat_level: 0, children: [] },
          { cat_id: '8', cat_name: '公务员考试', cat_deleted: false, cat_level: 0, children: [] }
        ],
        cateProps: {
          label: 'cat_name',
          value: 'cat_id',
          children: 'children'
        }
      }
    },
    created() {
    },
    methods: {
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
          this.$message({
            type: 'success',
            message: '删除成功!'
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
        const Eform = { goods_name: row.goods_name, goods_oldPrice: row.goods_oldPrice, goods_curPrice: row.goods_curPrice, goods_condition: row.goods_condition.toString(), goods_paint: row.goods_paint.toString(), goods_note: row.goods_note.toString(), goods_introduce: row.goods_introduce }
        this.goodEditForm = Eform
        console.log(Eform)
        this.goodsEditordialogVisible = true
      },
      // 修改图书信息并提交
      addgoodsInfo() {
        this.$refs.goodsEditorFormRef.validate(valid => {
          if (!valid) return
          // 关闭对话框
          this.goodsEditordialogVisible = false
          // 提示修改成功
          this.$message.success('修改图书信息成功！')
        })
      }
    }
  }
</script>

<style lang="less" scoped>
</style>
