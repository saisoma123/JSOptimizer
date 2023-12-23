const acorn = require('acorn');
const walk = require('acorn-walk');
const escodegen = require('escodegen');

// Maybe Monad Definition
class Maybe {
  constructor(value) {
    this.value = value;
  }

  static of(value) {
    return new Maybe(value);
  }

  bind(fn) {
    return this.value == null ? Maybe.of(null) : fn(this.value);
  }

  getValue() {
    return this.value;
  }
}

// Function to transform nested function calls
function transformNestedCalls(node) {
  if (node.type === 'CallExpression') {
    let functions = [];
    let current = node;
    let innerMostArgument = null;

    while (current && current.type === 'CallExpression') {
      functions.push(current.callee);
      if (current.arguments && current.arguments.length > 0) {
        innerMostArgument = current.arguments[0];
        current = current.arguments[0];
      } else {
        break;
      }
    }

    functions.reverse();

    if (functions.length > 1 && innerMostArgument) {
      const composedCall = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'composeMultiple' },
        arguments: functions
      };

      return {
        type: 'CallExpression',
        callee: composedCall,
        arguments: [innerMostArgument]
      };
    }
  }
  return node;
}

// Helper function to generate the code for a single call expression
function generateCallCode(callExpression, useBindVariable) {
  let methodCode = callExpression.callee.property.name;
  return useBindVariable ? `x.${methodCode}()` : `${callExpression.callee.object.name}.${methodCode}()`;
}

function transformMethodChain(code) {
  const ast = acorn.parse(code);

  if (ast.body[0].type === 'ExpressionStatement' &&
    ast.body[0].expression.type === 'CallExpression') {

    let callExpressions = [];
    let currentCall = ast.body[0].expression;

    while (currentCall && currentCall.type === 'CallExpression') {
      callExpressions.unshift(currentCall);
      currentCall = currentCall.callee.object;
    }

    let transformedCode = `Maybe.of(${generateCallCode(callExpressions[0], false)})`;

    for (let i = 1; i < callExpressions.length; i++) {
      transformedCode += `.bind(x => ${generateCallCode(callExpressions[i], true)})`;
    }
    transformedCode += ".getValue()"
    return transformedCode;
  } else {
    return code;
  }
}

// Sample JavaScript code with nested function calls
const code1 = `let result = f(g(h(x)));`;

// Parse the code into an AST for the first segment
const ast1 = acorn.parse(code1, { ecmaVersion: 2020 });

// Walk the AST and transform nested calls
ast1.body = ast1.body.map(node => {
  if (node.type === 'VariableDeclaration') {
    node.declarations = node.declarations.map(declaration => {
      if (declaration.init && declaration.init.type === 'CallExpression') {
        declaration.init = transformNestedCalls(declaration.init);
      }
      return declaration;
    });
  }
  return node;
});

// Add the composeMultiple function definition
const composeMultipleAST = acorn.parse(`
function composeMultiple(...funcs) {
  return function(x) {
    return funcs.reduce((acc, currFunc) => currFunc(acc), x);
  };
}`, { ecmaVersion: 2020 });
ast1.body.unshift(composeMultipleAST.body[0]);

// Generate the transformed JavaScript code for the first segment
const transformedCode1 = escodegen.generate(ast1);
console.log(transformedCode1);

// Sample JavaScript code with a method chain from the second segment
const code2 = `obj.call1().call2().call3();`;

// Apply the transformation for the second segment
const transformedCode2 = transformMethodChain(code2);
console.log(transformedCode2);
