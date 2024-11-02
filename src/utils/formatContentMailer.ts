export const generateEmailContent = (
  customerName: string,
  orderId: string,
  nameShop: string,
  product: any,
  state: any
) => {
  return `
     <div style="font-family: Arial, sans-serif; color: #333;">
      <p>Kính chào <strong>${customerName}</strong>,</p>

      <p>Cảm ơn quý khách đã tin tưởng và lựa chọn dịch vụ của chúng tôi.</p>

      <p>Đơn hàng của quý khách với mã đơn <strong>${orderId}</strong> đã được ${state}. Dưới đây là thông tin chi tiết về các sản phẩm trong đơn hàng:</p>

      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr>
            <th style="padding: 8px; border: 1px solid #ddd; background-color: #f4f4f4; text-align: left;">Sản phẩm</th>
            <th style="padding: 8px; border: 1px solid #ddd; background-color: #f4f4f4; text-align: center;">Số lượng</th>
            <th style="padding: 8px; border: 1px solid #ddd; background-color: #f4f4f4; text-align: right;">Giá</th>
          </tr>
        </thead>
        <tbody>
         <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${product.name}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${
          product.quantity
        }</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${product.price.toFixed(
          2
        )}₫</td>
      </tr>
        </tbody>
      </table>

      <p>Chúng tôi cam kết sẽ mang đến cho quý khách trải nghiệm tốt nhất và luôn sẵn sàng hỗ trợ nếu có bất kỳ thắc mắc nào.</p>

      <p>Trân trọng,</p>
      <p>Đội ngũ hỗ trợ khách hàng</p>
      <p><em>Cửa hàng ${nameShop}</em></p>
    </div>
    `;
};
export const generateEmailContentCancel = (
  customerName: string,
  orderId: string,
  nameShop: string,
  product: any,
  state: any,
  note: string
) => {
  return `
       <div style="font-family: Arial, sans-serif; color: #333;">
        <p>Kính chào <strong>${customerName}</strong>,</p>
  
        <p>Cảm ơn quý khách đã tin tưởng và lựa chọn dịch vụ của chúng tôi.</p>
  
        <p>Đơn hàng của quý khách với mã đơn <strong>${orderId}</strong> đã được ${state}. Dưới đây là thông tin chi tiết về các sản phẩm trong đơn hàng:</p>
        <h3>Lí do: ${note}</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr>
              <th style="padding: 8px; border: 1px solid #ddd; background-color: #f4f4f4; text-align: left;">Sản phẩm</th>
              <th style="padding: 8px; border: 1px solid #ddd; background-color: #f4f4f4; text-align: center;">Số lượng</th>
              <th style="padding: 8px; border: 1px solid #ddd; background-color: #f4f4f4; text-align: right;">Giá</th>
            </tr>
          </thead>
          <tbody>
           <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${product.name}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${
            product.quantity
          }</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${product.price.toFixed(
            2
          )}₫</td>
        </tr>
          </tbody>
        </table>
  
        <p>Chúng tôi cam kết sẽ mang đến cho quý khách trải nghiệm tốt nhất và luôn sẵn sàng hỗ trợ nếu có bất kỳ thắc mắc nào.</p>
  
        <p>Trân trọng,</p>
        <p>Đội ngũ hỗ trợ khách hàng</p>
        <p><em>Cửa hàng ${nameShop}</em></p>
      </div>
      `;
};
export const generateEmailContentPrePared = (
  customerName: string,
  orderId: string,
  nameShop: string,
  product: any
) => {
  return `
         <div style="font-family: Arial, sans-serif; color: #333;">
          <p>Kính chào <strong>${customerName}</strong>,</p>
          <p>Cảm ơn quý khách đã tin tưởng và lựa chọn dịch vụ của chúng tôi.</p>
          <p>Đơn hàng của quý khách với mã đơn <strong>${orderId}</strong> đã được xác nhận bởi cửa hàng của chúng tôi. Chúng tôi sẽ giao hàng cho quý khách sớm nhất có thể. Dưới đây là thông tin chi tiết về các sản phẩm trong đơn hàng:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr>
                <th style="padding: 8px; border: 1px solid #ddd; background-color: #f4f4f4; text-align: left;">Sản phẩm</th>
                <th style="padding: 8px; border: 1px solid #ddd; background-color: #f4f4f4; text-align: center;">Số lượng</th>
                <th style="padding: 8px; border: 1px solid #ddd; background-color: #f4f4f4; text-align: right;">Giá</th>
              </tr>
            </thead>
            <tbody>
             <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${
              product.name
            }</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${
              product.quantity
            }</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${product.price.toFixed(
              2
            )}₫</td>
          </tr>
            </tbody>
          </table>
    
          <p>Chúng tôi cam kết sẽ mang đến cho quý khách trải nghiệm tốt nhất và luôn sẵn sàng hỗ trợ nếu có bất kỳ thắc mắc nào.</p>
    
          <p>Trân trọng,</p>
          <p>Đội ngũ hỗ trợ khách hàng</p>
          <p><em>Cửa hàng ${nameShop}</em></p>
        </div>
        `;
};

export const generateEmailContentShipping = (
  customerName: string,
  orderId: string,
  nameShop: string,
  product: any
) => {
  return `
           <div style="font-family: Arial, sans-serif; color: #333;">
            <p>Kính chào <strong>${customerName}</strong>,</p>
            <p>Cảm ơn quý khách đã tin tưởng và lựa chọn dịch vụ của chúng tôi.</p>
            <p>Đơn hàng của quý khách với mã đơn <strong>${orderId}</strong> đã được xác nhận bởi cửa hàng giao cho bên vận chuyển và sẽ được giao đến quý khách sớm nhất , vui lòng để ý số điện thoại của quy khách, Cửa hàng xin cảm ơn!. Dưới đây là thông tin chi tiết về các sản phẩm trong đơn hàng:</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr>
                  <th style="padding: 8px; border: 1px solid #ddd; background-color: #f4f4f4; text-align: left;">Sản phẩm</th>
                  <th style="padding: 8px; border: 1px solid #ddd; background-color: #f4f4f4; text-align: center;">Số lượng</th>
                  <th style="padding: 8px; border: 1px solid #ddd; background-color: #f4f4f4; text-align: right;">Giá</th>
                </tr>
              </thead>
              <tbody>
               <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">${
                product.name
              }</td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${
                product.quantity
              }</td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${product.price.toFixed(
                2
              )}₫</td>
            </tr>
              </tbody>
            </table>
      
            <p>Chúng tôi cam kết sẽ mang đến cho quý khách trải nghiệm tốt nhất và luôn sẵn sàng hỗ trợ nếu có bất kỳ thắc mắc nào.</p>
      
            <p>Trân trọng,</p>
            <p>Đội ngũ hỗ trợ khách hàng</p>
            <p><em>Cửa hàng ${nameShop}</em></p>
          </div>
          `;
};
