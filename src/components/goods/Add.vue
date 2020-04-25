<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false">
      </el-alert>
      <!--步骤条-->
      <el-steps :active="activeIndex - 0" align-center finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!--标签页-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs tab-position="left" v-model="activeIndex" :before-leave="beforeTabLeave">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="图书名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="图书原价" prop="goods_oldPrice">
              <el-input v-model="addForm.goods_oldPrice" type="number"></el-input>
            </el-form-item>
            <el-form-item label="图书售价" prop="goods_curPrice">
              <el-input v-model="addForm.goods_curPrice" type="number"></el-input>
            </el-form-item>
            <el-form-item label="图书新旧程度" prop="goods_condition">
              <el-radio-group v-model="addForm.goods_condition">
                <el-radio label="100" border>全新</el-radio>
                <el-radio label="99" border>99新</el-radio>
                <el-radio label="90" border>9成新</el-radio>
                <el-radio label="70" border>7成新</el-radio>
                <el-radio label="50" border>5成新</el-radio>
                <el-radio label="30" border>3成新</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="图书涂抹程度" prop="goods_paint">
              <el-radio-group v-model="addForm.goods_paint">
                <el-radio label="0" border>无涂抹</el-radio>
                <el-radio label="5" border>一点点</el-radio>
                <el-radio label="10" border>不多</el-radio>
                <el-radio label="50" border>多</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="图书笔记数量" prop="goods_note">
              <el-radio-group v-model="addForm.goods_note">
                <el-radio label="100" border>满满的笔记</el-radio>
                <el-radio label="50" border>半本笔记</el-radio>
                <el-radio label="20" border>少量的笔记</el-radio>
                <el-radio label="0" border>没有笔记</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="图书分类" prop="goods_cat">
              <el-cascader
                expand-trigger="hover"
                :options="catelist"
                :props="cateProps"
                v-model="addForm.goods_cat"
                @change="parentCateChanged"
                placeholder="试试搜索：数一"
                clearable
                change-on-select
                filterable>
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="1">
            <el-upload
              class="upload-demo"
              action="https://jsonplaceholder.typicode.com/posts/"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :file-list="fileList"
              list-type="picture-card">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">请上传三张图片，分别表示图书正面，反面，侧面</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="2">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品的按钮 -->
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <!-- 图片预览 -->
      <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
        <img :src="previewPath" alt="" class="previewImg">
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
 data() {
   return {
     activeIndex: '0',
     // 添加商品的表单数据对象
     addForm: {
       goods_name: '',
       goods_oldPrice: 0,
       goods_curPrice: 0,
       goods_condition: '90',
       goods_paint: '5',
       goods_note: '20',
       // 商品所属的分类数组
       goods_cat: [],
       // 图书描述
       goods_introduce: ''
     },
     addFormRules: {
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
     },
     // 上传图片的URL地址
     fileList: [
       { name: 'food.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100' },
       { name: 'food2.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100' },
       { name: 'food3.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100' }
       ],
     // 预览图片的地址
     previewPath: '',
     // 预览图片的开关
     previewVisible: false
   }
 },
  methods: {
    beforeTabLeave(activeName, oldActiveName) {
      // console.log('即将离开的标签页名字是：' + oldActiveName)
      // console.log('即将进入的标签页名字是：' + activeName)
      // return false
      if (oldActiveName === '0' && this.addForm.goods_cat.length < 1) {
        this.$message.error('请先选择商品分类！')
        return false
      }
    },
    // 处理移除图片的操作
    handleRemove(file, fileList) {
    },
    // 处理图片预览效果
    handlePreview(file) {
      console.log(file)
      this.previewPath = file.url
      this.previewVisible = true
    },
    // 添加商品
    add() {
      this.$refs.addFormRef.validate(valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项！')
        }
        if (this.fileList.length !== 3) {
          return this.$message.error('请上传三张图片')
        }
        console.log(this.fileList.length)
        this.$message.success('添加商品成功！')
        this.$router.push('/goods')
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .el-checkbox {
    margin: 0 10px 0 0 !important;
  }

  .previewImg {
    width: 100%;
  }

  .btnAdd {
    margin-top: 15px;
  }
</style>
