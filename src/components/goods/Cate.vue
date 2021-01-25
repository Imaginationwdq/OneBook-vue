<template>
    <div>
      <!-- 面包屑导航区域 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品分类</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 卡片视图区域 -->
      <el-card>
        <!--添加分类按钮区-->
        <el-row><el-col><el-button type="primary" @click="showAddCateDialog">添加分类</el-button></el-col></el-row>

        <!--表格-->
        <tree-table class="treeTable" :data="catelist" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="#" border :show-row-hover="false">
          <!-- 是否有效 -->
          <template slot="isok" slot-scope="scope">
            <i class="el-icon-success" v-if="scope.row.status === '1'" style="color: lightgreen;"></i>
            <i class="el-icon-error" v-else style="color: red;"></i>
          </template>
          <!-- 排序 -->
          <template slot="order" slot-scope="scope">
            <el-tag size="mini" v-if="scope.row.level=== '1'">一级</el-tag>
            <el-tag type="success" size="mini" v-else-if="scope.row.level=== '2'">二级</el-tag>
            <el-tag type="warning" size="mini" v-else-if="scope.row.level=== '3'">三级</el-tag>
            <el-tag type="danger" size="mini" v-else-if="scope.row.level=== '4'">四级</el-tag>
            <el-tag type="danger" size="mini" v-else>五级</el-tag>
          </template>
          <!-- 操作 -->
          <template slot="opt" slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showCateEditDialog(scope.row)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCateById(scope.row)">删除</el-button>
          </template>
        </tree-table>
        <!--分页区域-->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[4,8,16]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </el-card>
      <!-- 添加分类的对话框 -->
      <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
        <!-- 添加分类的表单 -->
        <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
          <el-form-item label="分类名称：" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类：">
            <!-- options 用来指定数据源 -->
            <!-- props 用来指定配置对象 -->
            <el-cascader
              expand-trigger="hover"
              :options="catelist"
              :props="cascaderProps"
              v-model="selectedKeys"
              @change="parentCateChanged"
              placeholder="试试搜索：法考"
              clearable
              change-on-select
              filterable>
            </el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
      </el-dialog>,
      <!-- 编辑分类的对话框 -->
      <el-dialog title="编辑分类" :visible.sync="cateEditorDialogVisible" width="40%" @close="setCateDialogClosed">
        <!--树形控件-->
        <el-tree :data="catelist" :props="treeProps" show-checkbox node-key="cat_id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
        <span slot="footer" class="dialog-footer">
        <el-button @click="cateEditorDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotCates">确 定</el-button>
      </span>
      </el-dialog>
    </div>
</template>

<script>
  export default {
    data() {
      return {
        queryInfo: {
          type: '',
          // 当前的页数
          pagenum: 1,
          // 当前每页显示多少条数据
          pagesize: 4
        },
        total: 8,
        catelist: [],
        // 为table指定列的定义
        columns: [
          {
            label: '分类名称',
            prop: 'categoryName'
          },
          {
            label: '是否有效',
            // 表示，将当前列定义为模板列
            type: 'template',
            // 表示当前这一列使用模板名称
            template: 'isok'
          },
          {
            label: '排序',
            // 表示，将当前列定义为模板列
            type: 'template',
            // 表示当前这一列使用模板名称
            template: 'order'
          },
          {
            label: '操作',
            // 表示，将当前列定义为模板列
            type: 'template',
            // 表示当前这一列使用模板名称
            template: 'opt'
          }
        ],
        // 控制添加分类对话框的显示与隐藏
        addCateDialogVisible: false,
        // 添加分类表单的验证规则对象
        addCateFormRules: {
          cat_name: [
            { required: true, message: '请输入分类名称', trigger: 'blur' }
          ]
        },
        // 添加分类的表单数据对象
        addCateForm: {
          // 将要添加的分类的名称
          cat_name: '',
          // 父级分类的Id
          cat_pid: 0,
          // 分类的等级，默认要添加的是1级分类
          cat_level: 0
        },
        // 指定级联选择器的配置对象
        cascaderProps: {
          value: 'categoryId',
          label: 'categoryName',
          children: 'children'
        },
        // 选中的父级分类的Id数组
        selectedKeys: [],
        // 显示编辑分类的开关
        cateEditorDialogVisible: false,
        // 树形控件
        treeProps: {
          children: 'children',
          label: 'categoryName'
        },
        // 默认选中的节点Id值数组
        defKeys: [0, 1]
      }
    },
    created () {
      this.getCatelist()
    },
    methods: {
      // 添加分类,选中父类的值
      parentCateChanged(data) {
        console.log(data)
      },
      // 获取角色列表
      getCatelist () {
        const params = new URLSearchParams()
        params.append('page', this.queryInfo.pagenum)
        params.append('limit', this.queryInfo.pagesize)
        this.$http.post(`/onebook/category/treeList`, params)
          .then(({ data }) => {
            if (data && data.code === 0) {
              this.catelist = data.page.records
              this.total = Number(data.page.total)
              this.queryInfo.pagesize = Number(data.page.size)
              this.queryInfo.pagenum = Number(data.page.current)
            } else {
              this.catelist = []
              this.total = 0
            }
          })
      },
      // 监听 pagesize 改变
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        this.getCatelist()
      },
      // 监听 pagenum 改变
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        this.getCatelist()
      },
      // 点击按钮，展示添加分类的对话框
      showAddCateDialog() {
        this.addCateDialogVisible = true
      },
      // 监听对话框的关闭事件，重置表单数据
      addCateDialogClosed() {
        this.$refs.addCateFormRef.resetFields()
        this.selectedKeys = []
        this.addCateForm.cat_level = 0
        this.addCateForm.cat_pid = 0
      },
      // 点击按钮，添加新的分类
      addCate() {
        this.$refs.addCateFormRef.validate(valid => {
          if (!valid) return
          this.$message.success('添加分类成功！')
          this.addCateDialogVisible = false
        })
      },
      // 根据Id删除商品分类
      removeCateById(data) {
        this.$confirm(`此操作将永久删除该${data.cat_level + 1}级分类, 是否继续?`, '提示', {
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
      // 展示编辑分类
      showCateEditDialog() {
        this.cateEditorDialogVisible = true
      },
      // 监听编辑分类对话框的关闭事件
      setCateDialogClosed() {
        this.defKeys = []
      },
      // 确定编辑分类
      allotCates() {
        this.cateEditorDialogVisible = false
        // 提示修改成功
        this.$message.success('分类修改成功！')
      }
    }
  }
</script>

<style lang="less" scoped>
  .treeTable {
    margin-top: 15px;
  }

  .el-cascader {
    width: 100%;
  }
</style>
