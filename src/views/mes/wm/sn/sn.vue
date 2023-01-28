<template>
    <div class="app-container">
      <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px">
        <el-form-item label="SN码" prop="snCode">
          <el-input
            v-model="queryParams.snCode"
            placeholder="请输入SN码"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    
      <el-table v-loading="loading" :data="snList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="SN" align="center" prop="snCode" />
        <el-table-column label="赋码" align="center" prop="snCode" />
        <el-table-column label="产品编码" align="center" prop="itemCode" />
        <el-table-column label="产品名称" align="center" prop="itemName" />
        <el-table-column label="规格型号" align="center" prop="specification" />
        <el-table-column label="单位" align="center" prop="unitOfMeasure" />
        <el-table-column label="批次号" align="center" prop="batchCode" />       
        <el-table-column label="生成时间" align="center" prop="genDate" width="120">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.rtDate, '{y}-{m}-{d} {h}:{mi}:{s}') }}</span>
          </template>
        </el-table-column>        
      </el-table>
      
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
  
      <!-- 添加或修改SN码对话框 -->
      <el-dialog :title="title" :visible.sync="open" width="960px" append-to-body>
        <el-form ref="form" :model="form" :rules="rules" label-width="100px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="物料编码"  prop="itemCode">
                <el-input v-model="form.itemCode" readonly="readonly" placeholder="请选择物料编码" >
                  <el-button slot="append" @click="handleSelectProduct" icon="el-icon-search"></el-button>
                </el-input>
              </el-form-item>
              <ItemSelect ref="itemSelect" @onSelected="onItemSelected" > </ItemSelect>
            </el-col>
            <el-col :span="12">
              <el-form-item label="物料名称" prop="itemName">
                <el-input v-model="form.itemName" readonly="readonly" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="规格型号" prop="specification">
                <el-input v-model="form.specification" type="textarea" readonly="readonly" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="批次号" prop="batchCode">
                <el-input v-model="form.batchCode" placeholder="请输入批次号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="SN码数量" prop="snNum">
                <el-input-number :min="1" :max="1000" v-model="form.snNum" placeholder="请输入需要生成的SN码数量" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </el-dialog>
    </div>
  </template>
  
  <script>
  import { listSn,list, getSn, delSn, addSn, updateSn } from "@/api/mes/wm/sn";
  import ItemSelect  from "@/components/itemSelect/single.vue";
  export default {
    name: "Sn",
    components :{ItemSelect},
    data() {
      return {
        // 遮罩层
        loading: true,
        // 选中数组
        ids: [],
        // 非单个禁用
        single: true,
        // 非多个禁用
        multiple: true,
        // 显示搜索条件
        showSearch: true,
        // 总条数
        total: 0,
        // SN码表格数据
        snList: [],
        // 弹出层标题
        title: "",
        // 是否显示弹出层
        open: false,
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 20,
          snCode: null,        itemId: null,        itemCode: null,        itemName: null,        specification: null,        unitOfMeasure: null,        batchCode: null,      },
        // 表单参数
        form: {},
        // 表单校验
        rules: {
          snNum: [
            { required: true, message: "请输入需要生成的SN码数量", trigger: "blur" }
          ],        itemCode: [
            { required: true, message: "产品物料不能为空", trigger: "blur" }
          ],      }
      };
    },
    created() {
      this.getList();
    },
    methods: {
      /** 查询SN码列表 */
      getList() {
        this.loading = true;
        listSn(this.queryParams).then(response => {
          this.snList = response.rows;
          this.total = response.total;
          this.loading = false;
        });
      },
      // 取消按钮
      cancel() {
        this.open = false;
        this.reset();
      },
      // 表单重置
      reset() {
        this.form = {
          snId: null,        snCode: null,        itemId: null,        itemCode: null,        itemName: null,        specification: null,        unitOfMeasure: null,        batchCode: null,        remark: null,        attr1: null,        attr2: null,        attr3: null,        attr4: null,        createBy: null,        createTime: null,        updateBy: null,        updateTime: null      };
        this.resetForm("form");
      },
      /** 搜索按钮操作 */
      handleQuery() {
        this.queryParams.pageNum = 1;
        this.getList();
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.resetForm("queryForm");
        this.handleQuery();
      },
      // 多选框选中数据
      handleSelectionChange(selection) {
        this.ids = selection.map(item => item.snId)
        this.single = selection.length!==1
        this.multiple = !selection.length
      },
      //点开查看界面
      handleView(row){
        
      },
      /** 新增按钮操作 */
      handleAdd() {
        this.reset();
        this.open = true;
        this.title = "生成SN码";
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset();
        const snId = row.snId || this.ids
        getSn(snId).then(response => {
          this.form = response.data;
          this.open = true;
          this.title = "修改SN码";
        });
      },
      /** 提交按钮 */
      submitForm() {
        this.$refs["form"].validate(valid => {
          if (valid) {
              addSn(this.form).then(response => {
                this.$modal.msgSuccess("生成成功");
                this.open = false;
                this.getList();
              });
          }
        });
      },
      /** 删除按钮操作 */
      handleDelete(row) {
        const snIds = row.snId || this.ids;
        this.$modal.confirm('是否确认删除SN码编号为"' + snIds + '"的数据项？').then(function() {
          return delSn(snIds);
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        }).catch(() => {});
      },
      /** 导出按钮操作 */
      handleExport() {
        this.download('wm/sn/export', {
          ...this.queryParams
        }, `sn_${new Date().getTime()}.xlsx`)
      },
      handleSelectProduct(){
        this.$refs.itemSelect.showFlag = true;
      },
      //物料选择弹出框
      onItemSelected(obj){
          debugger;
          if(obj != undefined && obj != null){
            this.form.itemId = obj.itemId;
            this.form.itemCode = obj.itemCode;
            this.form.itemName = obj.itemName;
            this.form.specification = obj.specification;
            this.form.unitOfMeasure = obj.unitOfMeasure;  
          }
      },
    }
  };
  </script>
  