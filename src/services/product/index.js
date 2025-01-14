
const Service = require("../service");
const {
  Product,
  Product_image,
  Category,
  Stock_opname,
  Inventory,
  Admin,
} = require("../../lib/sequelize");
const { Op } = require("sequelize");
class productService extends Service {
  // npx nodemon . --inspect
  static getProduct = async (req) => {
    try {
      const {
        _sortBy = "",
        _sortDir = "",
        _limit = undefined,
        _page = 1,
        priceMin,
        priceMax,
        selectedProduct,
        searchProduct,
      } = req.query;
      delete req.query._limit;
      delete req.query._page;
      delete req.query._sortBy;
      delete req.query._sortDir;
      delete req.query.priceMin;
      delete req.query.priceMax;
      delete req.query.selectedProduct;
      delete req.query.searchProduct;

      let whereCategoryClause = {};
      let searchByNameClause = {};

      if (selectedProduct) {
        whereCategoryClause.categoryId = selectedProduct;
      }

      if (searchProduct) {
        searchByNameClause = {
          med_name: { [Op.like]: `%${searchProduct}%` },
        };
      }

      const findProducts = await Product.findAndCountAll({
        where: {
          ...req.query,
          // med_name: {[Op.like]: `%${req.query.med_name}%`}
          selling_price: {
            [Op.between]: [priceMin || 0, priceMax || 999999999],
          },
          ...searchByNameClause,
          ...whereCategoryClause,
        },

        limit: _limit ? parseInt(_limit) : undefined,
        offset: (_page - 1) * _limit,
        order: _sortBy ? [[_sortBy, _sortDir]] : undefined,
        distinct: true,
        include: [
          {
            model: Product_image,
            attributes: ["id", "image_url"],
          },
          {
            model: Category,
            attributes: ["category_name", "id"],
            where: req.query?.categoryId ? { id: req.query.categoryId } : {},
          },
          {
            model: Stock_opname,
            attributes: ["amount"],
          },
          {
            model: Inventory,
          },
        ],
      });
      return this.handleSuccess({
        message: "Products found",
        statusCode: 200,
        data: {
          result: findProducts,
          meta: {
            page: _page,
            limit: _limit,
            count: findProducts.count,
            totalPages: Math.ceil(findProducts.count / _limit),
          },
        },
      });
    } catch (err) {
      console.log(err);
      this.handleError({
        message: "Server Error",
        statusCode: 500,
      });
    }
  };
  static editNama = async (req) => {
    try {
      const { id } = req.params;
      const findProduct = await Product.findByPk(id, {
        include: [
          {
            model: Product_image,
            attributes: ["image_url"],
          },
          {
            model: Inventory,
            include: [
              {
                model: Admin,
              },
              {
                model: Product,
                include: Stock_opname,
              },
            ],
          },
          {
            model: Stock_opname,
            attributes: ["amount"],
          },
        ],
      });
      if (findUser) {
        return this.handleError({
          message: "username has been taken",
          statusCode: 400,
        });
      }
      await User.update(
        {
          name: username,
        },
        {
          where: {
            id: 1,
          },
        }
      );
      const name = await User.findOne({
        where: {
          id: 1,
        },
        attributes: ["name"],
      });
      return this.handleSuccess({
        message: "your name was changed successfully",
        statusCode: 201,
        data: name,
      });
    } catch (err) {
      console.log(err);
      this.handleError({
        message: "Server Error",
        statusCode: 500,
      });
    }
  };
  static addProduct = async (req) => {
    try {
      const {
        med_name,
        nomer_med,
        nomer_bpom,
        selling_price,
        discount,
        indikasi,
        kandungan,
        kemasan,
        categoryId,
      } = req.body;

      const checkNameRegister = await Product.findOne({
        where: {
          med_name,
        },
      });

      if (checkNameRegister) {
        return this.handleError({
          message: "Product Already Registered",
          statusCode: 400,
        });
      }

      const checkNoMedRegister = await Product.findOne({
        where: {
          nomer_med,
        },
      });

      if (checkNoMedRegister) {
        return this.handleError({
          message: "No_med already Registered to other Product",
          statusCode: 400,
        });
      }
      const checkBpomRegister = await Product.findOne({
        where: {
          nomer_bpom,
        },
      });

      if (checkBpomRegister) {
        return this.handleError({
          message: "No_bpom already Registered to other Product",
          statusCode: 400,
        });
      }

      const inputProduct = await Product.create({
        med_name,
        nomer_med,
        nomer_bpom,
        selling_price,
        discount,
        indikasi,
        kandungan,
        kemasan,
        categoryId,
      });

      const result = await Product.findOne({
        where: {
          id: inputProduct.dataValues.id,
        },
        include: {
          model: Category,
          attributes: ["id", "category_name"],
        },
      });

      return this.handleSuccess({
        message: "new product Sucesss",
        statusCode: 201,
        data: result,
      });
    } catch (err) {
      console.log(err);
      this.handleError({
        message: "Server Error",
        statusCode: 500,
      });
    }
  };
  static tambahNomorHp = async (req) => {
    try {
      const { id } = req.params;
      const uploadFileDomain = process.env.UPLOAD_FILE_DOMAIN;
      const filePath = `products`;
      const selectedFile = req.files;

      if (!selectedFile) {
        return this.handleError({
          message: "there's no picture selected",
          statusCode: 400,
        });
      }

      const data = selectedFile.map((val) => {
        return {
          ProductId: id,
          image_url: `${uploadFileDomain}/${filePath}/${val.filename}`,
        };
      });

      const uploadPicture = await Product_image.bulkCreate(data);

      if (!uploadPicture) {
        return this.handleError({
          message: "upload error",
          statusCode: 400,
        });
      }

      const updateData = await Product_image.findAll({
        where: {
          ProductId: id,
        },
        attributes: ["id", "image_url"],
      });
      return this.handleSuccess({
        message: "your phone number was created successfully",
        statusCode: 201,
        data: updateData,
      });
    } catch (err) {
      console.log(err);
      this.handleError({
        message: "Server Error",
        statusCode: 500,
      });
    }
  };
  static getAddress = async (req) => {
    try {
      const address = await User.findAndCountAll({
        where: {
          id: 1,
        },
        include: [
          {
            model: Address,
            attributes: [
              "labelAlamat",
              "nama",
              "nomorHp",
              "provinsi",
              "kotaKabupaten",
              "kecamatan",
              "alamat",
              "kodePos",
              "id",
            ],
          },
        ],
      });
      return this.handleSuccess({
        message: "your address was added successfully",
        statusCode: 201,
        data: address.rows,
      });
    } catch (err) {
      console.log(err);
      this.handleError({
        message: "Server Error",
        statusCode: 500,
      });
    }
  };
  static getProductCategory = async (req) => {
    try {
      const findCategory = await Category.findAll();

      return this.handleSuccess({
        message: "delete product success",
        statusCode: 200,
      });
    } catch (err) {
      console.log(err);
      this.handleError({
        message: "Server Error",
        statusCode: 500,
      });
    }
  };
  static deleteProductImage = async (req) => {
    try {
      const { ProductId, id } = req.params;

      const erase = await Product_image.destroy({
        where: {
          ProductId,
          id,
        },
      });

      return this.handleSuccess({
        message: "succes delete image",
        statusCode: 200,
      });
    } catch (err) {
      return this.handleError({});
    }
  };
  static updateProduct = async (req) => {
    try {
      const { id } = req.params;
      const {
        med_name,
        nomer_med,
        nomer_bpom,
        selling_price,
        discount,
        indikasi,
        kandungan,
        kemasan,
        categoryId,
      } = req.body;

      const checkDuplicate = await Product.findOne({
        where: {
          [Op.or]: [{ med_name }, { nomer_bpom }, { nomer_med }],
          id: {
            [Op.ne]: id,
          },
        },
      });

      if (checkDuplicate?.dataValues.med_name === med_name) {
        return this.handleError({
          message: "data duplicate please try another med_name",
          statusCode: 400,
        });
      } else if (checkDuplicate?.dataValues.nomer_bpom === nomer_bpom) {
        return this.handleError({
          message: "data duplicate please try another nomer_bpom",
          statusCode: 400,
        });
      } else if (checkDuplicate?.dataValues.nomer_med === nomer_med) {
        return this.handleError({
          message: "data duplicate please try another nomer_med",
          statusCode: 400,
        });
      }
      const updateData = await Product.update(
        {
          med_name,
          nomer_med,
          nomer_bpom,
          selling_price,
          discount,
          indikasi,
          kandungan,
          kemasan,
          categoryId,
        },
        { where: { id } }
      );

      return this.handleSuccess({
        message: "edit data success",
        statusCode: 200,
        data: updateData,
      });
    } catch (err) {
      console.log(err);
      return this.handleError({});
    }
  };
  static getProductById = async (req) => {
    try {
      const { id } = req.params;
      const findProduct = await Product.findByPk(id, {
        include: [
          {
            model: Product_image,
            attributes: ["image_url"],
          },
          {
            model: Inventory,
            include: [
              {
                model: Admin,
              },
              {
                model: Product,
                include: Stock_opname,
              },
            ],
          },
          {
            model: Stock_opname,
            attributes: ["amount"],
          },
        ],
      });
      return this.handleSuccess({
        message: "Product found successfully",
        statusCode: 200,
        data: findProduct,
      });
    } catch (err) {
      console.log(err);
      this.handleError({
        message: "Server Error",
        statusCode: 500,
      });
    }
  };
}
module.exports = productService;

