<template>
  <el-dialog title="生产任务选择"
    v-if="showFlag"
    :visible.sync="showFlag"
    :modal= false
    width="80%"
    center
    >
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px">
      <el-row>
        <el-col :span="8">
          <el-form-item label="所属工序" prop="processName">
            <el-select v-model="queryParams.processId" placeholder="请选择工序">
                <el-option
                  v-for="item in processOptions"
                  :key="item.processId"
                  :label="item.processName"
                  :value="item.processId"
                ></el-option>
              </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="所属工作站" prop="workstationCode">
            <el-input
              v-model="queryParams.workstationCode"
              placeholder="请输入工作站编号"
              clearable
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="任务编号" prop="taskCode">
            <el-input
              v-model="queryParams.taskCode"
              placeholder="请输入生产任务编号"
              clearable
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>       
        <el-col :span="8">
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  
      <el-table v-loading="loading" :data="protaskList" @current-change="handleCurrent" @row-dblclick="handleRowDbClick">
        <el-table-column  width="55" align="center" >
          <template v-slot="scope">
            <el-radio v-model="selectedTaskId" :label="scope.row.taskId" @change="handleRowChange(scope.row)">{{""}}</el-radio>
          </template>
        </el-table-column>  
        <el-table-column label="任务编号" align="center" width="100px" prop="taskCode" :show-overflow-tooltip="true"/>
        <el-table-column label="任务名称" align="center" width="120px" prop="taskName" :show-overflow-tooltip="true"/>
        <el-table-column label="工作站编号" align="center" width="150px" prop="workstationCode" :show-overflow-tooltip="true"/>
        <el-table-column label="工作站名称" align="center" width="150px" prop="workstationName" :show-overflow-tooltip="true"/>      
        <el-table-column label="排产数量" align="center" prop="quantity" />
        <el-table-column label="已生产数量" align="center" width="100px" prop="quantityProduced" />
        <el-table-column label="开始生产时间" align="center" prop="startTime" width="180">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.startTime,'{y}-{m}-{d} {h}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="生产时长" align="center" prop="duration" />
        <el-table-column label="预计完成时间" align="center" prop="endTime" width="180">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.endTime,'{y}-{m}-{d} {h}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="显示颜色" align="center" prop="colorCode" >
          <template slot-scope="scope">
            <el-color-picker v-model="scope.row.colorCode" disabled></el-color-picker>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="100px" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['pro:protask:edit']"
            >修改</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['pro:protask:remove']"
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
      <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="confirmSelect">确 定</el-button>
      <el-button @click="showFlag=false">取 消</el-button>
    </div>
    </el-dialog>
  </template>
  
  <script>
  import { listProtask, getProtask, delProtask, addProtask, updateProtask } from "@/api/mes/pro/protask";
  import {listAllProcess} from "@/api/mes/pro/process";
  import WorkstationSelect from "@/components/workstationSelect/simpletableSingle.vue"
  export default {
    name: "ProtaskSelect",
    components: {WorkstationSelect},
    props: {
      workorderId: null,
      workorderCode: null,
      processId: null,
      processCode: null,
      workstationId: null,
      workstationCode: null
    },
    watch: {
      workorderId(v){
        this.queryParams.workorderId = v;
      }
    },
    data() {
      return {
        showFlag: false,
        selectedTaskId: undefined,
        selectedRow: undefined,
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
        // 生产任务表格数据
        protaskList: [],
        // 弹出层标题
        title: "",
        // 是否显示弹出层
        open: false,
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          taskCode: null,
          taskName: null,
          workorderId: this.workorderId,
          workorderCode: null,
          workorderName: null,
          workstationId: null,
          workstationCode: null,
          workstationName: null,
          processId: this.processId,
          processCode: null,
          processName: null,
          itemId: null,
          itemCode: null,
          itemName: null,
          specification: null,
          unitOfMeasure: null,
          quantity: null,
          quantityProduced: null,
          quantityChanged: null,
          clientId: null,
          clientCode: null,
          clientName: null,
          clientNick: null,
          startTime: null,
          duration: null,
          endTime: null,
          colorCode: null,
          requestDate: null,
        },
        // 表单参数
        form: {},
        // 表单校验
        rules: {
          workstationId: [
            { required: true, message: "工作站不能为空", trigger: "blur" }
          ],
          quantity: [
            { required: true, message: "排产数量不能为空", trigger: "blur" }
          ],
          startTime: [
            { required: true, message: "请选择开始生产日期",trigger: "blur"}
          ],
          duration: [
            { required: true, message: "清输入估算的生产用时",trigger: "blur"}
          ]
        }
      };
    },
    created() {
      this.getList();
      this.getProcess();
    },
    methods: {
      /** 查询生产任务列表 */
      getList() {
        this.loading = true;
        listProtask(this.queryParams).then(response => {
          this.protaskList = response.rows;
          this.total = response.total;
          this.loading = false;
        });
      },
      //查询工序信息
      getProcess(){
        listAllProcess().then( response =>{
          this.processOptions = response.data;
        });
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
     
      handleCurrent(row){
        if(row){
            this.selectedRow = row;
          }
      },
      //行双击选中
      handleRowDbClick(row){
        if(row){
          this.selectedRow = row;
          this.$emit('onSelected',this.selectedRow);
          this.showFlag = false;
        }
      },
      // 单选选中数据
      handleRowChange(row) {
        debugger;
        if(row){
          this.selectedRow = row;
        }
      },
      //确定选中
      confirmSelect(){
          if(this.selectedTaskId ==null || this.selectedTaskId==0){
              this.$notify({
                  title:'提示',
                  type:'warning',
                  message: '请至少选择一条数据!'
              });
              return;
          }
          this.$emit('onSelected',this.selectedRow);
          this.showFlag = false;
      }
    }
  };
  </script>
  