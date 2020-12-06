<template>
  <el-row>
    <el-col :span="24"><div class="grid-content bg-purple-light">
      <el-calendar v-model="value">
      </el-calendar>
    </div></el-col>
  </el-row>
</template>

<script>
  export default {
    data() {
      return {
        value: new Date()
      }
    }
  }
</script>

<style lang="less" scoped>

</style>
