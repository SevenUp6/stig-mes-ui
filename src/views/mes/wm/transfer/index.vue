<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="转移单编号" prop="transferCode">
        <el-input
          v-model="queryParams.transferCode"
          placeholder="请输入转移单编号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="转移单名称" prop="transferName">
        <el-input
          v-model="queryParams.transferName"
          placeholder="请输入转移单名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="转移单类型" prop="transferType">
        <el-select v-model="queryParams.transferType" placeholder="请选择转移单类型" clearable>
          <el-option
            v-for="dict in dict.type.mes_transfer_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="移出仓库" prop="fromWarehouseName">
        <el-input
          v-model="queryParams.fromWarehouseName"
          placeholder="请输入移出仓库名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="移入仓库" prop="toWarehouseName">
        <el-input
          v-model="queryParams.toWarehouseName"
          placeholder="请输入移入仓库名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['mes:wm:transfer:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['mes:wm:transfer:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['mes:wm:transfer:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="transferList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="转移单编号" align="center" prop="transferCode" >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="handleView(scope.row)"
            v-hasPermi="['mes:wm:transfer:query']"
          >{{scope.row.transferCode}}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="转移单名称" align="center" prop="transferName" />
      <el-table-column label="转移单类型" align="center" prop="transferType">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.mes_transfer_type" :value="scope.row.transferType"/>
        </template>
      </el-table-column>
      <el-table-column label="移出仓库" align="center" prop="fromWarehouseName" />
      <el-table-column label="移入仓库" align="center" prop="toWarehouseName" />
      <el-table-column label="转移日期" align="center" prop="transferDate" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.transferDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="单据状态" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.mes_order_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-video-play"
            v-if="(scope.row.status =='PREPARE' && scope.row.transferType == 'INNER')"            
            @click="handleExecute(scope.row)"
            v-hasPermi="['mes:wm:transfer:edit']"
          >执行转移</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-video-play"
            v-if="(scope.row.status =='PREPARE' && scope.row.transferType == 'OUTER')"            
            @click="handleTransOut(scope.row)"
            v-hasPermi="['mes:wm:transfer:edit']"
          >执行移出</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-video-play"
            v-if="(scope.row.status =='CONFIRMED' && scope.row.transferType == 'OUTER')"            
            @click="handleExecute(scope.row)"
            v-hasPermi="['mes:wm:transfer:edit']"
          >执行移入</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-if="scope.row.status == 'PREPARE'"
            v-hasPermi="['mes:wm:transfer:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-if="scope.row.status == 'PREPARE'"
            v-hasPermi="['mes:wm:transfer:remove']"
          >删除</el-button>
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

    <!-- 添加或修改转移单对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="960px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="8">
            <el-form-item label="转移单编号" prop="transferCode">
              <el-input v-model="form.transferCode" placeholder="请输入转移单编号" />
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item  label-width="80">
              <el-switch v-model="autoGenFlag"
                  active-color="#13ce66"
                  active-text="自动生成"
                  @change="handleAutoGenChange(autoGenFlag)" v-if="optType != 'view' && form.status =='PREPARE'">               
              </el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="转移单名称" prop="transferName">
              <el-input v-model="form.transferName" placeholder="请输入转移单名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="转移单类型">
              <el-radio-group v-model="form.transferType">
                <el-radio
                  v-for="dict in dict.type.mes_transfer_type"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="16" v-if="form.transferType == 'OUTER'">
            <el-form-item label="目的地" prop="destination">
              <el-input v-model="form.destination" placeholder="请输入目的地" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="form.transferType == 'OUTER'">
          <el-col :span="8">
            <el-form-item label="承运商" prop="carrier">
              <el-input v-model="form.carrier" placeholder="请输入承运商" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="托运单号" prop="bookingNote">
              <el-input v-model="form.bookingNote" placeholder="请输入托运单号" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="收货人" prop="receiver">
              <el-input v-model="form.receiver" placeholder="收货人" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="移出仓库" prop="fromWarehouseId">
              <el-select v-model="form.fromWarehouseId" placeholder="请选择移出仓库" clearable>
                <el-option
                  v-for="dict in warehouseList"
                  :key="dict.warehosueId"
                  :label="dict.warehouseName"
                  :value="dict.warehouseId"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="移入仓库" prop="toWarehouseId">
              <el-select v-model="form.toWarehouseId" placeholder="请选择移入仓库" clearable>
                <el-option
                  v-for="dict in warehouseList"
                  :key="dict.warehosueId"
                  :label="dict.warehouseName"
                  :value="dict.warehouseId"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="转移日期" prop="transferDate">
              <el-date-picker clearable
                v-model="form.transferDate"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择转移日期">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
            </el-form-item>
          </el-col>
        </el-row>

      </el-form>
      <el-divider v-if="form.transferId !=null" content-position="center">物料信息</el-divider> 
        <el-card shadow="always" v-if="form.transferId !=null" class="box-card">
          <Transferline ref=line :transferId="form.transferId" :fromWarehouseId="form.fromWarehouseId" :toWarehouseId="form.toWarehouseId" :optType="optType"></Transferline>
        </el-card>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="cancel" v-if="optType =='view' || form.status !='PREPARE' ">返回</el-button>
        <el-button type="primary" @click="submitForm" v-if="form.status =='PREPARE' && optType !='view' ">确 定</el-button>        
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listTransfer, getTransfer, delTransfer, addTransfer, updateTransfer, execute} from "@/api/mes/wm/transfer";
import {listWarehouse} from "@/api/mes/wm/warehouse"; 
import {genCode} from "@/api/system/autocode/rule";
import Transferline from "./line.vue";
export default {
  name: "Transfer",
  components: {Transferline},
  dicts: ['mes_transfer_type','mes_order_status'],
  data() {
    return {
      //自动生成编码
      autoGenFlag:false,
      optType: undefined,      
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
      // 转移单表格数据
      transferList: [],
      warehouseList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        transferCode: null,        transferName: null,        transferType: null,        destination: null,        carrier: null,        bookingNote: null,        fromWarehouseId: null,        fromWarehouseCode: null,        fromWarehouseName: null,        toWarehouseId: null,        toWarehouseCode: null,        toWarehouseName: null,        transferDate: null,        status: null,      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        transferCode: [
          { required: true, message: "转移单编号不能为空", trigger: "blur" }
        ],        
        transferName: [
          { required: true, message: "转移单名称不能为空", trigger: "blur" }
        ],        
        transferType: [
          { required: true, message: "转移单类型不能为空", trigger: "blur" }
        ],
        transferDate: [
          { required: true, message: "请选择转移时间", trigger: "blur" }
        ],
        fromWarehouseId: [
          { required: true, message: "请选择转出仓库", trigger: "blur" }
        ],
        toWarehouseId: [
          { required: true, message: "请选择转入仓库", trigger: "blur" }
        ]      
      }
    };
  },
  created() {
    this.getList();
    this.getWarehouseList();
  },
  methods: {
    /** 查询转移单列表 */
    getList() {
      this.loading = true;
      listTransfer(this.queryParams).then(response => {
        this.transferList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    //获取仓库信息
    getWarehouseList(){
      listWarehouse().then(response => {
        this.warehouseList = response.rows;
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
        transferId: null,        
        transferCode: null,        
        transferName: null,        
        transferType: "INNER",        
        destination: null,        
        carrier: null,        
        bookingNote: null,        
        fromWarehouseId: null,        
        fromWarehouseCode: null,        
        fromWarehouseName: null,        
        toWarehouseId: null,        
        toWarehouseCode: null,        
        toWarehouseName: null,        
        transferDate: null,        
        status: "PREPARE",        
        remark: null,        
        attr1: null,        
        attr2: null,        
        attr3: null,        
        attr4: null,        
        createBy: null,        
        createTime: null,        
        updateBy: null,        
        updateTime: null      
      };
      this.autoGenFlag = false;
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
      this.ids = selection.map(item => item.transferId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加转移单";
      this.optType = "add";      
    },
    // 查询明细按钮操作
    handleView(row){
      this.reset();
      const transferId = row.transferId
      getTransfer(transferId).then(response => {
        this.form = response.data; 
        this.open = true;
        this.title = "查看转移单信息";
        this.optType = "view";
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const transferId = row.transferId || this.ids
      getTransfer(transferId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改转移单";
        this.optType = "edit";        
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          debugger;
          if (this.form.transferId != null) {
            updateTransfer(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addTransfer(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    handleTransOut(row){
      const transferId = row.transferId
      getTransfer(transferId).then(response => {
        this.form = response.data; 
        this.form.status = 'CONFIRMED';
        updateTransfer(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const transferIds = row.transferId || this.ids;
      this.$modal.confirm('是否确认删除转移单编号为"' + transferIds + '"的数据项？').then(function() {
        return delTransfer(transferIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    //执行转移
    handleExecute(row){
      const transferIds = row.transferId || this.ids;
      this.$modal.confirm('确认执行转移？').then(function() {
        return execute(transferIds)//执行转移
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("转移成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('wm/transfer/export', {
        ...this.queryParams
      }, `transfer_${new Date().getTime()}.xlsx`)
    },
    //自动生成编码
    handleAutoGenChange(autoGenFlag){
      if(autoGenFlag){
        genCode('TRANSFER_CODE').then(response =>{
          this.form.transferCode = response;
        });
      }else{
        this.form.transferCode = null;
      }
    }
  }
};
</script>
