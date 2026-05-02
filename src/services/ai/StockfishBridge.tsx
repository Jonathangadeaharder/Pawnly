/**
 * Stockfish Bridge Component
 *
 * React Native WebView bridge for running Stockfish engine.
 * This component loads Stockfish in a hidden WebView and provides
 * a message-passing interface for the app to communicate with it.
 */

import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { WebView } from 'react-native-webview';
import { StyleSheet } from 'react-native';

export interface StockfishBridgeRef {
  sendCommand: (command: string) => void;
  isReady: () => boolean;
}

interface StockfishBridgeProps {
  onMessage: (message: string) => void;
  onReady?: () => void;
  onError?: (error: any) => void;
}

const STOCKFISH_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Stockfish Bridge</title>
</head>
<body>
  <script src="https://cdn.jsdelivr.net/npm/stockfish@16.0.0/stockfish.js"></script>
  <script>
    let stockfish = null;
    let isReady = false;

    // Initialize Stockfish
    function initStockfish() {
      try {
        stockfish = new Worker('https://cdn.jsdelivr.net/npm/stockfish@16.0.0/stockfish.wasm.js');

        stockfish.onmessage = function(event) {
          const message = event.data;

          // Send message back to React Native
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'engine-message',
              data: message
            }));
          }

          // Check if engine is ready
          if (message.includes('uciok')) {
            isReady = true;
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'ready'
              }));
            }
          }
        };

        stockfish.onerror = function(error) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'error',
              data: error.message
            }));
          }
        };

        // Initialize UCI
        stockfish.postMessage('uci');

      } catch (error) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'error',
            data: error.message
          }));
        }
      }
    }

    // Handle messages from React Native
    window.addEventListener('message', function(event) {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'command' && stockfish) {
          stockfish.postMessage(data.data);
        }
      } catch (error) {
        // Ignore parse errors
      }
    });

    // Initialize on load
    window.onload = initStockfish;
  </script>
</body>
</html>
`;

export const StockfishBridge = forwardRef<StockfishBridgeRef, StockfishBridgeProps>(
  ({ onMessage, onReady, onError }, ref) => {
    const webViewRef = useRef<WebView>(null);
    const readyRef = useRef(false);

    useImperativeHandle(ref, () => ({
      sendCommand: (command: string) => {
        if (webViewRef.current && readyRef.current) {
          const message = JSON.stringify({
            type: 'command',
            data: command
          });
          webViewRef.current.postMessage(message);
        }
      },
      isReady: () => readyRef.current
    }));

    const handleMessage = (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);

        switch (data.type) {
          case 'ready':
            readyRef.current = true;
            onReady?.();
            break;

          case 'engine-message':
            onMessage(data.data);
            break;

          case 'error':
            onError?.(new Error(data.data));
            break;
        }
      } catch (error) {
        onError?.(error);
      }
    };

    return (
      <WebView
        ref={webViewRef}
        source={{ html: STOCKFISH_HTML }}
        style={styles.hidden}
        onMessage={handleMessage}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          onError?.(new Error(nativeEvent.description));
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
      />
    );
  }
);

const styles = StyleSheet.create({
  hidden: {
    width: 0,
    height: 0,
    opacity: 0
  }
});

StockfishBridge.displayName = 'StockfishBridge';
