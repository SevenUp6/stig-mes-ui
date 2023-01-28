<template>
    <el-dialog title="工作站选择"
    v-if="showFlag"
    :visible.sync="showFlag"
    :modal= false
    width="80%"
    center
  >
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="工单编码" prop="workorderCode">
        <el-input
          v-model="queryParams.workorderCode"
          placeholder="请输入工单编码"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="工单名称" prop="workorderName">
        <el-input
          v-model="queryParams.workorderName"
          placeholder="请输入工单名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="产品编号" prop="productCode">
        <el-input
          v-model="queryParams.productCode"
          placeholder="请输入产品编号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="产品名称" prop="productName">
        <el-input
          v-model="queryParams.productName"
          placeholder="请输入产品名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>


      <el-form-item label="客户名称" prop="clientName">
        <el-input
          v-model="queryParams.clientName"
          placeholder="请输入客户名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="workorderList" @current-change="handleCurrent" @row-dblclick="handleRowDbClick">
        <el-table-column width="55" align="center" >
            <template v-slot="scope">
                <el-radio v-model="selectedWorkorderId" :label="scope.row.workorderId" @change="handleRowChange(scope.row)">{{""}}</el-radio>
            </template>
        </el-table-column>
        <el-table-column label="工单编码" width="180" prop="workorderCode" >
        </el-table-column>
        <el-table-column label="工单名称" width="200" align="center" prop="workorderName" :show-overflow-tooltip="true"/>
        <el-table-column label="工单来源" align="center" prop="orderSource" >
            <template slot-scope="scope">
                <dict-tag :options="dict.type.mes_workorder_sourcetype" :value="scope.row.orderSource"/>
            </template>
        </el-table-column>
        <el-table-column label="订单编号" width="140" align="center" prop="sourceCode" />
        <el-table-column label="产品编号" width="120" align="center" prop="productCode" />
        <el-table-column label="产品名称" width="200" align="center" prop="productName" :show-overflow-tooltip="true"/>
        <el-table-column label="规格型号" align="center" prop="productSpc" :show-overflow-tooltip="true"/>
        <el-table-column label="单位" align="center" prop="unitOfMeasure" />
        <el-table-column label="工单数量" align="center" prop="quantity" />                 
        <el-table-column label="客户编码" align="center" prop="clientCode" />
        <el-table-column label="客户名称" align="center" prop="clientName" :show-overflow-tooltip="true"/>
        <el-table-column label="需求日期" align="center" prop="requestDate" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.requestDate, '{y}-{m}-{d}') }}</span>
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
    <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="confirmSelect">确 定</el-button>
        <el-button @click="showFlag=false">取 消</el-button>
    </div>
  </el-dialog>

</template>
<script>
    import { listWorkorder} from "@/api/mes/pro/workorder";
    export default {
        name: 'WorkOrderSelectSingle',
        components: {},
        dicts: ['mes_order_status','mes_workorder_sourcetype'],
        data() {
            return {
                showFlag: false,
                // 遮罩层
                loading: true,
                // 选中数组
                selectedWorkorderId: undefined,
                selectedRows: [],
                 // 非单个禁用
                single: true,
                // 非多个禁用
                multiple: true,
                // 显示搜索条件
                showSearch: true,
                // 总条数
                total: 0,
                 // 生产工单表格数据
                workorderList: [],
                 // 弹出层标题
                title: "",
                // 是否显示弹出层
                open: false,
                // 查询参数
                queryParams: {
                    workorderCode: null,
                    workorderName: null,
                    orderSource: null,
                    sourceCode: null,
                    productId: null,
                    productCode: null,
                    productName: null,
                    productSpc: null,
                    unitOfMeasure: null,
                    quantity: null,
                    quantityProduced: null,
                    quantityChanged: null,
                    quantityScheduled: null,
                    clientId: null,
                    clientCode: null,
                    clientName: null,
                    requestDate: null,
                    parentId: null,
                    ancestors: null,
                    status: 'CONFIRMED',
                },

            }
        },
        created() {
            this.getList();
        },
        methods:{
            /** 查询生产工单列表 */
            getList() {
                this.loading = true;
                listWorkorder(this.queryParams).then(response => {
                    this.workorderList = response.data;
                    this.loading = false;
                });
            },
            /** 搜索按钮操作 */
            handleQuery() {
                this.getList();
            },
            /** 重置按钮操作 */
            resetQuery() {
                this.resetForm("queryForm");
                this.handleQuery();
            },
            handleCurrent(row){
                if(row){
                    this.selectedRows = row;
                }
            },
            // 单选选中数据
            handleRowChange(row) {
                if(row){
                    this.selectedRows = row;
                }
            },
            //双击选中
            handleRowDbClick(row){
                if(row){
                    this.selectedRows = row;
                    this.$emit('onSelected',this.selectedRows);
                    this.showFlag = false;
                }
            },
            //确定选中
            confirmSelect(){
                if(this.selectedWorkorderId == null || this.selectedWorkorderId == 0){
                    this.$notify({
                        title:'提示',
                        type:'warning',
                        message: '请至少选择一条数据!'
                    });
                    return;
                }
                this.$emit('onSelected',this.selectedRows);
                this.showFlag = false;
            }
        }
    }
</script>