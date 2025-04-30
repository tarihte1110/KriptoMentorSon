const path = require('path');

module.exports = {
  entry: './src/index.js',   // Uygulamanızın giriş noktası
  output: {
    path: path.resolve(__dirname, 'dist'),   // Çıktı dosyalarının konulacağı klasör
    filename: 'bundle.js'    // Oluşturulan bundle dosyasının adı
  },
  resolve: {
    extensions: ['.js', '.jsx']  // .js ve .jsx uzantılarının otomatik olarak tanınması için
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,             // .js ve .jsx uzantılı dosyaları eşle
        exclude: /node_modules/,     // node_modules klasörünü dışarıda bırak
        use: {
          loader: 'babel-loader',    // Babel ile derleme yapar
          options: {
            presets: [
              '@babel/preset-env',   // Modern JS kodlarını ES5’e dönüştürür
              '@babel/preset-react'  // JSX ve React kodlarını derler
            ]
          }
        }
      }
    ]
  }
};
