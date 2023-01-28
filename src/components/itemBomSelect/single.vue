<template>
  <el-dialog title="产品BOM物料选择"
    v-if="showFlag"
    :visible.sync="showFlag"
    :modal= false
    width="80%"
    center
  >
      <el-table v-loading="loading" :data="bomList" @current-change="handleCurrent" @row-dblclick="handleRowDbClick">
        <el-table-column width="50" align="center" >
              <template v-slot="scope">
                  <el-radio v-model="selectedItemId" :label="scope.row.bomItemId" @change="handleRowChange(scope.row)">{{""}}</el-radio>
              </template>
          </el-table-column>
        <el-table-column label="物料编码" align="center" prop="bomItemCode" />
        <el-table-column label="物料名称" align="center" prop="bomItemName" :show-overflow-tooltip="true" />
        <el-table-column label="规格" align="center" prop="bomItemSpec" :show-overflow-tooltip="true" />
        <el-table-column label="单位" width="60px" align="center" prop="unitOfMeasure" />
        <el-table-column label="使用比例" width="90px" align="center" prop="quantity" />  
        <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />  
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
  import { listBom } from "@/api/mes/md/bom";
  
  export default {
    name: "ItemBomSelectSingle",
    props: {
        itemId: undefined
    },
    data() {
      return {
        showFlag: false,
        // 遮罩层
        loading: true,
        selectedItemId: undefined,
        selectedRows: undefined,
        // 非单个禁用
        single: true,
        // 非多个禁用
        multiple: true,
        // 显示搜索条件
        showSearch: true,
        // 总条数
        total: 0,
        // 产品BOM关系表格数据
        bomList: [],
        // 弹出层标题
        title: "",
        // 是否显示弹出层
        open: false,
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          itemId: this.itemId,
          bomItemId: null,
          bomItemCode: null,
          bomItemName: null,
          bomItemSpec: null,
          unitOfMeasure: null,
          quantity: null,
          enableFlag: null,
          attr1: null,
          attr2: null,
          attr3: null,
          attr4: null,
        }
      };
    },
    created() {
      this.getList();
    },
    methods: {
        /** 查询产品BOM关系列表 */
        getList() {
            debugger;
            this.loading = true;
            listBom(this.queryParams).then(response => {
            this.bomList = response.rows;
            this.total = response.total;
            this.loading = false;
            });
        },
        handleCurrent(row){
            if(row){
                this.selectedRows = row;
            }
        },
        handleRowDbClick(row){
            if(row){
                this.selectedRows = row;
                this.$emit('onSelected',this.selectedRows);
                this.showFlag = false;
            }
        },
        // 单选选中数据
        handleRowChange(row) {
            if(row){
                this.selectedRows = row;
            }
        },


        //确定选中
        confirmSelect(){
            if(this.selectedItemId ==null || this.selectedItemId==0){
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
  };
  </script>
  