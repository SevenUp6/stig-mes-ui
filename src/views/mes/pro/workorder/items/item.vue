<template>
    <div class="app-container">
  
      <el-table v-loading="loading" :data="productBomList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="物料编号" width="120" align="center" prop="bomItemCode" />
        <el-table-column label="物料名称" width="200" align="center" prop="bomItemName" :show-overflow-tooltip="true"/>
        <el-table-column label="规格型号" align="center" prop="bomItemSpec" :show-overflow-tooltip="true"/>
        <el-table-column label="单位" align="center" prop="unitOfMeasure" />
        <el-table-column label="物料/产品" align="center" prop="itemOrProduct" >
          <template slot-scope="scope">
            <dict-tag :options="dict.type.mes_item_product" :value="scope.row.itemOrProduct"/>
          </template>
        </el-table-column>
        <el-table-column label="预计使用量" align="center" prop="quantity" />
      </el-table>
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </div>
  </template>
  
  <script>
  import { listItems } from "@/api/mes/pro/workorder";
  export default {
    name: "WorkorderItemList",
    dicts: ['mes_item_product'],
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
        // 物料需求
        productBomList: [],
        // 弹出层标题
        title: "",
        // 是否显示弹出层
        open: false,
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          workorderId: null,
          productId: null,
          productCode: null,
          productName: null,
          productSpc: null,
          unitOfMeasure: null,
          itemOrProduct: null,
          quantity: null,
        }
      };
    },
    props: {
        optType: undefined,
        workorder: undefined
    },
    created() {
      this.getList();
    },
    methods: {
      /** 查询生产工单BOM组成列表 */
      getList() {
        this.loading = true;
        this.queryParams.workorderId = this.workorder.workorderId;
        this.queryParams.productId = this.workorder.productId;
        this.queryParams.quantity = this.workorder.quantity;
        listItems(this.queryParams).then(response => {
            debugger;
          this.productBomList = response.rows;
          this.total = response.total;
          this.loading = false;
        });
      }
    }
  };
  </script>
  